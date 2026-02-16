import { Injectable } from '@angular/core';

export type NetworkErrorType = 'timeout' | 'connection-reset' | 'dns-failure' | 'offline';

export class NetworkError extends Error {
  constructor(public readonly type: NetworkErrorType, message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export interface NetworkSimulationProfile {
  label: string;
  enabled: boolean;
  /** Base latency range in ms */
  latencyRange: [min: number, max: number];
  /** Probability of a latency spike (0-1) */
  spikeChance: number;
  /** Latency spike range in ms */
  spikeLatencyRange: [min: number, max: number];
  /** Probability that any request fails (0-1) */
  failureRate: number;
  /** Probability of a request timing out instead of erroring instantly (0-1) */
  timeoutChance: number;
  /** Time before a request is considered timed out in ms */
  timeoutDuration: number;
}

export const NETWORK_SIMULATION_PROFILES = {
  none: {
    label: 'No simulation',
    enabled: false,
    latencyRange: [0, 0],
    spikeChance: 0,
    spikeLatencyRange: [0, 0],
    failureRate: 0,
    timeoutChance: 0,
    timeoutDuration: 0,
  },
  '4g': {
    label: '4G',
    enabled: true,
    latencyRange: [30, 100],
    spikeChance: 0.05,
    spikeLatencyRange: [200, 800],
    failureRate: 0.02,
    timeoutChance: 0.3,
    timeoutDuration: 5000,
  },
  '3g': {
    label: '3G',
    enabled: true,
    latencyRange: [100, 500],
    spikeChance: 0.15,
    spikeLatencyRange: [1500, 5000],
    failureRate: 0.12,
    timeoutChance: 0.4,
    timeoutDuration: 8000,
  },
  '2g': {
    label: '2G',
    enabled: true,
    latencyRange: [300, 1200],
    spikeChance: 0.25,
    spikeLatencyRange: [3000, 10000],
    failureRate: 0.25,
    timeoutChance: 0.5,
    timeoutDuration: 15000,
  },
  'offline': {
    label: 'Offline',
    enabled: true,
    latencyRange: [0, 0],
    spikeChance: 0,
    spikeLatencyRange: [0, 0],
    failureRate: 1,
    timeoutChance: 0.5,
    timeoutDuration: 10000,
  },
} as const satisfies Record<string, NetworkSimulationProfile>;

export type NetworkSimulationType = keyof typeof NETWORK_SIMULATION_PROFILES;

@Injectable({
  providedIn: 'root',
})
export class NetworkSimulation {

  profile: NetworkSimulationProfile = { ...NETWORK_SIMULATION_PROFILES.none };

  use(type: NetworkSimulationType): void {
    this.profile = { ...NETWORK_SIMULATION_PROFILES[type] };
  }

  simulatedLatency(): number {
    const cfg = this.profile;
    if (!cfg.enabled) return 0;
    const [min, max] = Math.random() < cfg.spikeChance
      ? cfg.spikeLatencyRange
      : cfg.latencyRange;
    return min + Math.random() * (max - min);
  }

  randomFailure(): NetworkError | null {
    const cfg = this.profile;
    if (!cfg.enabled || Math.random() >= cfg.failureRate) return null;

    const errors: [NetworkErrorType, string][] = [
      ['connection-reset', 'net::ERR_CONNECTION_RESET'],
      ['dns-failure', 'net::ERR_NAME_NOT_RESOLVED'],
      ['offline', 'net::ERR_INTERNET_DISCONNECTED'],
    ];
    const [type, msg] = errors[Math.floor(Math.random() * errors.length)];
    return new NetworkError(type, msg);
  }

  wrap<R>(syncFn: () => R): Promise<R> {
    const cfg = this.profile;
    if (!cfg.enabled) {
      try {
        return Promise.resolve(syncFn());
      } catch (e) {
        return Promise.reject(e);
      }
    }

    const failure = this.randomFailure();
    const latency = this.simulatedLatency();

    if (failure) {
      const isTimeout = Math.random() < cfg.timeoutChance;
      const delay = isTimeout ? cfg.timeoutDuration : latency;
      const error = isTimeout
        ? new NetworkError('timeout', `Request timed out after ${cfg.timeoutDuration}ms`)
        : failure;

      return new Promise<R>((_, reject) => {
        setTimeout(() => reject(error), delay);
      });
    }

    return new Promise<R>((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(syncFn());
        } catch (e) {
          reject(e);
        }
      }, latency);
    });
  }
}

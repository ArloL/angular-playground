import { Component, inject, OnInit, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { CurrentUserService } from './services/current-user';
import { NetworkSimulation } from './services/network-simulation';
import { TestDataService } from './services/test-data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  buildTimestamp = environment.buildTimestamp;
  menuOpen = signal(false);

  currentUserService = inject(CurrentUserService);
  networkSimulation = inject(NetworkSimulation);
  testData = inject(TestDataService);
  router = inject(Router);
  swUpdate = inject(SwUpdate);
  updateAvailable = signal(false);
  checkingForUpdate = signal(false);
  loggingIn = signal(false);
  loginError = signal('');

  logout() {
    this.currentUserService.logout();
    this.router.navigate(['/']);
  }

  async login() {
    this.loggingIn.set(true);
    this.loginError.set('');
    try {
      await this.currentUserService.login();
      this.router.navigate(['/groups']);
    } catch {
      this.loginError.set('Login failed. Please try again.');
    } finally {
      this.loggingIn.set(false);
    }
  }

  async checkForUpdate() {
    if (!this.swUpdate.isEnabled) return;
    this.checkingForUpdate.set(true);
    try {
      const updateFound = await this.swUpdate.checkForUpdate();
      this.updateAvailable.set(updateFound);
    } finally {
      this.checkingForUpdate.set(false);
    }
  }

  async applyUpdate() {
    await this.swUpdate.activateUpdate();
    document.location.reload();
  }

  async ngOnInit() {
    await this.testData.generate();
    this.networkSimulation.use('3g');
  }
}

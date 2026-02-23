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
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  protected buildTimestamp = environment.buildTimestamp;
  protected currentUserService = inject(CurrentUserService);
  private networkSimulation = inject(NetworkSimulation);
  private testData = inject(TestDataService);
  private router = inject(Router);
  protected swUpdate = inject(SwUpdate);
  protected updateAvailable = signal(false);
  protected checkingForUpdate = signal(false);
  protected loggingIn = signal(false);
  protected loginError = signal('');
  protected loggingOut = signal(false);

  protected async logout() {
    this.loggingOut.set(true);
    try {
      await this.currentUserService.logout();
    } finally {
      this.loggingOut.set(false);
      this.router.navigate(['/']);
    }
  }

  protected async login() {
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

  protected async checkForUpdate() {
    if (!this.swUpdate.isEnabled) return;
    this.checkingForUpdate.set(true);
    try {
      const updateFound = await this.swUpdate.checkForUpdate();
      this.updateAvailable.set(updateFound);
    } finally {
      this.checkingForUpdate.set(false);
    }
  }

  protected async applyUpdate() {
    await this.swUpdate.activateUpdate();
    document.location.reload();
  }

  public async ngOnInit() {
    await this.testData.generate();
    this.networkSimulation.use('3g');
  }
}

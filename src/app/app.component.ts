import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { CurrentUserService } from './services/current-user';
import { GroupStore } from './services/group-store';
import { UserStore } from './services/user-store';
import { ExpenseStore } from './services/expense-store';
import { NetworkSimulation } from './services/network-simulation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  buildTimestamp = environment.buildTimestamp;
  menuOpen = signal(false);

  currentUserService = inject(CurrentUserService);
  groupStore = inject(GroupStore);
  userStore = inject(UserStore);
  expenseStore = inject(ExpenseStore);
  networkSimulation = inject(NetworkSimulation);
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
    var user1 = await this.userStore.save({ name: 'Christopher', email: 'christopher@example.com', friends: [] });
    var user2 = await this.userStore.save({ name: 'Nathaniel', email: 'nathaniel@example.com', friends: [] });
    var user3 = await this.userStore.save({ name: 'Samantha', email: 'samantha@example.com', friends: [] });

    user1 = await this.userStore.save({ ...user1, friends: [user2.id] });
    user2 = await this.userStore.save({ ...user2, friends: [user3.id] });
    user3 = await this.userStore.save({ ...user3, friends: [user1.id] });

    var group1 = await this.groupStore.save({
      name: 'Bloemendaal',
      users: [user1.id, user2.id],
      createdBy: user1.id,
    });
    var group2 = await this.groupStore.save({
      name: 'Paris',
      users: [user2.id, user3.id],
      createdBy: user2.id,
    });
    var group3 = await this.groupStore.save({
      name: 'Spain',
      users: [user3.id, user1.id],
      createdBy: user3.id,
    });

    await this.expenseStore.save({
      cost: 600,
      createdBy: user1.id,
      groupId: group1.id,
      description: 'Croissants',
      currency: '€',
      category: '🥐',
      date: new Date(),
      shares: [
        {
          userId: user1.id,
          owed: 300,
          included: true
        },
        {
          userId: user2.id,
          owed: 300,
          included: true
        }
      ]
    });

    await this.expenseStore.save({
      cost: 600,
      createdBy: user2.id,
      groupId: group2.id,
      description: 'Croissants',
      currency: '€',
      category: '🥐',
      date: new Date(),
      shares: [
        {
          userId: user2.id,
          owed: 300,
          included: true
        },
        {
          userId: user3.id,
          owed: 300,
          included: true
        }
      ]
    });

    await this.expenseStore.save({
      cost: 900,
      createdBy: user3.id,
      groupId: group3.id,
      description: 'Tapas',
      currency: '€',
      category: '🥐',
      date: new Date(),
      shares: [
        {
          userId: user3.id,
          owed: 600,
          included: true
        },
        {
          userId: user1.id,
          owed: 300,
          included: true
        }
      ]
    });

    this.networkSimulation.use("3g");
  }

}

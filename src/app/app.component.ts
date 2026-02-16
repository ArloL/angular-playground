import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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

  async ngOnInit() {
    if (this.buildTimestamp !== "DEVELOPMENT") {
      return;
    }

    var user1 = await this.userStore.save({ name: 'Christopher', friends: [] });
    var user2 = await this.userStore.save({ name: 'Nathaniel', friends: [] });
    var user3 = await this.userStore.save({ name: 'Samantha', friends: [] });

    user1 = await this.userStore.save({ ...user1, friends: [user2.id, user3.id] });
    user2 = await this.userStore.save({ ...user2, friends: [user1.id, user3.id] });
    user3 = await this.userStore.save({ ...user3, friends: [user1.id, user2.id] });

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

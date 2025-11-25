import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { GroupStore } from './services/group-store';
import { UserStore } from './services/user-store';
import { ExpenseStore } from './services/expense-store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  buildTimestamp = environment.buildTimestamp;

  groupStore = inject(GroupStore);
  userStore = inject(UserStore);
  expenseStore = inject(ExpenseStore);

  async ngOnInit() {
    var user1 = await this.userStore.save({ name: 'Christopher' });
    var user2 = await this.userStore.save({ name: 'Nathaniel' });
    var user3 = await this.userStore.save({ name: 'Samantha' });

    var group1 = await this.groupStore.save({
      name: 'Bloemendaal',
      users: [user1.id, user2.id, user3.id],
      createdBy: user1.id,
    });
    var group2 = await this.groupStore.save({
      name: 'Paris',
      users: [user1.id, user2.id],
      createdBy: user2.id,
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
  }

}

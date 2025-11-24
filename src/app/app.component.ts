import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { GroupStore } from './services/group-store';
import { UserStore } from './services/user-store';

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

  async ngOnInit() {
    var user1 = await this.userStore.save({ name: 'Christopher' });
    var user2 = await this.userStore.save({ name: 'Nathaniel' });
    var user3 = await this.userStore.save({ name: 'Samantha' });

    await this.groupStore.save({
      name: 'Bloemendaal',
      users: [user1.id, user2.id, user3.id],
      createdBy: user1.id,
    });
    await this.groupStore.save({
      name: 'Paris',
      users: [user1.id, user2.id],
      createdBy: user2.id,
    });
  }

}

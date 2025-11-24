import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserStore } from '../../services/user-store';

@Component({
  selector: 'apezzi-users-view',
  imports: [RouterLink],
  templateUrl: './users-view.html',
  styleUrl: './users-view.scss',
})
export class UsersView {

  userStore = inject(UserStore);

  users = resource({
    loader: () => this.userStore.findAll(),
  });

}

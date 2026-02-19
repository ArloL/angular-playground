import { inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user';
import { UserStore } from './user-store';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private userStore = inject(UserStore);

  public user = signal<User | undefined>(undefined);

  public async login() {
    const users = await this.userStore.findAll();
    if (users.length > 0) {
      const randomIndex = Math.floor(Math.random() * users.length);
      this.user.set(users[randomIndex]);
    }
  }

  public logout() {
    this.user.set(undefined);
  }
}

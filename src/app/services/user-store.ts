import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { AbstractStore } from './store';

@Injectable({
  providedIn: 'root',
})
export class UserStore extends AbstractStore<User> {

  async findByEmail(email: string): Promise<User | undefined> {
    const results = await this.findWithFilter(user => user.email === email);
    return results[0];
  }

}

import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { AbstractStore } from './store';

@Injectable({
  providedIn: 'root',
})
export class UserStore extends AbstractStore<User> {

}

import { Injectable } from '@angular/core';
import { Group } from '../models/group';
import { generateId } from '../helper/generate-id';
import { User, UserId } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserStore {

  private data: User[] = [{
    id: generateId(),
    name: 'Christopher',
    createdAt: new Date(),
    updatedAt: new Date(),
  }, {
    id: generateId(),
    name: 'Nathaniel',
    createdAt: new Date(),
    updatedAt: new Date(),
  }, {
    id: generateId(),
    name: 'Samantha',
    createdAt: new Date(),
    updatedAt: new Date(),
    }];

  first(): User {
    return this.data[0];
  }

  findById(userId: UserId): User {
    return this.data.filter(user => user.id === userId)[0];
  }

  findByIds(userIds: UserId[]): User[] {
    return this.data.filter(user => userIds.includes(user.id));
  }

  all(): User[] {
    return [...this.data]
  }

}

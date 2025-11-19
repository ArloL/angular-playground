import { inject, Injectable } from '@angular/core';
import { Group, GroupId } from '../models/group';
import { generateId } from '../helper/generate-id';
import { UserStore } from './user-store';

@Injectable({
  providedIn: 'root',
})
export class GroupStore {

  private userStore = inject(UserStore);

  private data: Group[] = [{
    id: generateId(),
    name: 'Lovefoxes',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: this.userStore.all().map(user => user.id),
    createdBy: this.userStore.first().id,
  },{
    id: generateId(),
    name: 'Bloemendaal',
    createdAt: new Date(),
    updatedAt: new Date(),
    users: this.userStore.all().map(user => user.id),
    createdBy: this.userStore.first().id,
  }];

  first(): Group {
    return this.data[0];
  }

  findById(groupId: GroupId): Group {
    return this.data.filter(group => group.id === groupId)[0];
  }

  all(): Group[] {
    return [...this.data]
  }

  add(group: Group) {
    this.data.push(group);
  }

}

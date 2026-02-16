import { Injectable } from '@angular/core';
import { Group } from '../models/group';
import { AbstractStore } from './store';
import { EntityId } from '../models/entity';

@Injectable({
  providedIn: 'root',
})
export class GroupStore extends AbstractStore<Group> {

  findAllWhereUserIsPartOf(userId: EntityId): Promise<Group[]> {
    return this.findWithFilter(group => group.users.includes(userId));
  }

}

import { Injectable } from '@angular/core';
import { Group } from '../models/group';
import { AbstractStore } from './store';

@Injectable({
  providedIn: 'root',
})
export class GroupStore extends AbstractStore<Group> {

}

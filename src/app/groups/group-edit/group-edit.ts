import { Component, input } from '@angular/core';
import { GroupId } from '../../models/group';

@Component({
  selector: 'apezzi-group-edit',
  imports: [],
  templateUrl: './group-edit.html',
  styleUrl: './group-edit.scss',
})
export class GroupEdit {

  readonly groupId = input.required<GroupId>();

}

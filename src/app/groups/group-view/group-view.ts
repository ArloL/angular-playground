import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { Group, GroupId } from '../../models/group';
import { GroupStore } from '../../services/group-store';
import { Router } from '@angular/router';

@Component({
  selector: 'apezzi-group-view',
  imports: [],
  templateUrl: './group-view.html',
  styleUrl: './group-view.scss',
})
export class GroupView {

  readonly groupId = input.required<GroupId>();

  private groupStore = inject(GroupStore);
  private router = inject(Router);

  group = linkedSignal<Group | null>(() => {
    var group = this.groupStore.findById(this.groupId());
    if (group) {
      return group;
    } else {
      this.router.navigate(['/']);
      return null;
    }
  });

}

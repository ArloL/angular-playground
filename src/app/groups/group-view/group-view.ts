import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { GroupId } from '../../models/group';
import { GroupStore } from '../../services/group-store';
import { debounce, Field, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';

interface GroupData { name: string }

@Component({
  selector: 'apezzi-group-view',
  imports: [Field],
  templateUrl: './group-view.html',
  styleUrl: './group-view.scss',
})
export class GroupView {

  readonly groupId = input.required<GroupId>();

  private groupStore = inject(GroupStore);
  private router = inject(Router);

  groupData = linkedSignal<GroupData>(() => {
    var group = this.groupStore.findById(this.groupId());
    if (group) {
      return { name: group.name };
    } else {
      this.router.navigate(['/']);
      return { name: '' };
    }
  });

  groupForm = form(this.groupData);

}

import { Component, inject, input, resource } from '@angular/core';
import { Entity, EntityId } from '../../models/entity';
import { GroupStore } from '../../services/group-store';
import { Group } from '../../models/group';

@Component({
  selector: 'apezzi-group-view',
  imports: [],
  templateUrl: './group-view.html',
  styleUrl: './group-view.scss',
})
export class GroupView {

  readonly groupId = input.required<EntityId>();

  private groupStore = inject(GroupStore);

  group = resource({
    params: () => ({ id: this.groupId() }),
    loader: ({ params }) => this.groupStore.findById(params.id),
  });

}

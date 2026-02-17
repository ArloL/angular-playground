import { Component, inject, input, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EntityId } from '../../models/entity';
import { GroupStore } from '../../services/group-store';
import { UserStore } from '../../services/user-store';

@Component({
  selector: 'apezzi-group-view',
  imports: [RouterLink],
  templateUrl: './group-view.html',
  styleUrl: './group-view.scss',
})
export class GroupView {

  readonly groupId = input.required<EntityId>();

  private groupStore = inject(GroupStore);
  private userStore = inject(UserStore);

  resourceData = resource({
    params: () => ({ id: this.groupId() }),
    loader: async ({ params }) => {
      const group = await this.groupStore.findById(params.id);
      const members = await this.userStore.findByIds(group.users);
      return { group, members };
    },
  });

}

import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrentUserService } from '../../services/current-user';
import { GroupStore } from '../../services/group-store';

@Component({
  selector: 'apezzi-groups-view',
  imports: [RouterLink],
  templateUrl: './groups-view.html',
  styleUrl: './groups-view.scss',
})
export class GroupsView {
  private currentUserService = inject(CurrentUserService);
  private groupStore = inject(GroupStore);

  protected groups = resource({
    loader: () => {
      const currentUser = this.currentUserService.user();
      if (!currentUser) {
        return Promise.resolve([]);
      }
      return this.groupStore.findAllWhereUserIsPartOf(currentUser.id);
    },
  });
}

import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupStore } from '../../services/group-store';

@Component({
  selector: 'apezzi-groups-view',
  imports: [RouterLink],
  templateUrl: './groups-view.html',
  styleUrl: './groups-view.scss',
})
export class GroupsView {

  groupStore = inject(GroupStore);

  groups = resource({
    loader: () => this.groupStore.findAll(),
  });

}

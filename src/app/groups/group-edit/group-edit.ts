import { Component, effect, inject, input, linkedSignal, resource, signal, Signal } from '@angular/core';
import { debounce, Field, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { GroupStore } from '../../services/group-store';
import { EntityId } from '../../models/entity';
import { Group } from '../../models/group';

@Component({
  selector: 'apezzi-group-edit',
  imports: [Field],
  templateUrl: './group-edit.html',
  styleUrl: './group-edit.scss',
})
export class GroupEdit {

  readonly groupId = input.required<EntityId>();

  private groupStore = inject(GroupStore);
  private router = inject(Router);

  group = resource({
    params: () => ({ id: this.groupId() }),
    loader: ({ params }) => this.groupStore.findById(params.id),
  });

  groupLoadEffect = effect(() => {
      const g = this.group.value();
      if (g) {
        this.groupData.set({ ...g });
      }
    });

  groupData = signal<Group>({ id: '', name: '', users: [], createdBy: '', createdAt: new Date(), updatedAt: new Date() });

  groupForm = form(this.groupData, (schemaPath) => {
    debounce(schemaPath.name, 150);
    required(schemaPath.name);
  });

  save() {
    if (this.group.hasValue()) {
      this.groupStore.save(this.groupData())
        .finally(() => this.router.navigate(['/groups']));
    }
  }

}

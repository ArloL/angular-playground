import { Component, inject, signal } from '@angular/core';
import { form, Field, debounce, required } from '@angular/forms/signals';
import { GroupStore } from '../../services/group-store';
import { generateId } from '../../helper/generate-id';
import { UserStore } from '../../services/user-store';

interface GroupData { name: string }

@Component({
  selector: 'apezzi-group-create',
  imports: [Field],
  templateUrl: './group-create.html',
  styleUrl: './group-create.scss',
})
export class GroupCreate {

  groupStore = inject(GroupStore);
  userStore = inject(UserStore);

  groupData = signal<GroupData>({ name: '', });

  groupForm = form(this.groupData, (schemaPath) => {
    debounce(schemaPath.name, 150);
    required(schemaPath.name)
  });

  save() {
    this.groupStore.add({
      id: generateId(),
      name: this.groupData().name,
      users: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userStore.first().id,
    });
    this.reset();
  }

  reset() {
    this.groupForm().reset();
    this.groupData.set({ name: '', });
  }

}

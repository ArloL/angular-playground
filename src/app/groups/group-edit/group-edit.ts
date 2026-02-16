import { Component, effect, inject, input, resource, signal, WritableSignal } from '@angular/core';
import { debounce, FormField, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { GroupStore } from '../../services/group-store';
import { UserStore } from '../../services/user-store';
import { CurrentUserService } from '../../services/current-user';
import { EntityId } from '../../models/entity';
import { Group } from '../../models/group';

interface SelectableUser {
  userId: EntityId;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'apezzi-group-edit',
  imports: [FormField],
  templateUrl: './group-edit.html',
  styleUrl: './group-edit.scss',
})
export class GroupEdit {

  readonly groupId = input.required<EntityId>();

  private currentUserService = inject(CurrentUserService);
  private groupStore = inject(GroupStore);
  private userStore = inject(UserStore);
  private router = inject(Router);

  resourceData = resource({
    params: () => ({ id: this.groupId() }),
    loader: async ({ params }) => {
      const [group, users] = await Promise.all([
        this.groupStore.findById(params.id),
        this.userStore.findAll(),
      ]);
      return { group, users };
    },
  });

  groupLoadEffect = effect(() => {
    if (this.resourceData.hasValue()) {
      this.groupData.set({ ...this.resourceData.value()!.group });
    }
  });

  selectableUsers: WritableSignal<SelectableUser[]> = signal([]);
  private selectableUsersInit = effect(() => {
    const currentUser = this.currentUserService.user();
    if (this.resourceData.hasValue() && currentUser) {
      const { group, users } = this.resourceData.value()!;
      const groupUserIds = new Set(group.users);
      this.selectableUsers.set(
        users
          .filter(u => u.id !== currentUser.id)
          .map(u => ({ userId: u.id, name: u.name, selected: groupUserIds.has(u.id) }))
      );
    }
  });

  groupData = signal<Group>({ id: '', name: '', users: [], createdBy: '', createdAt: new Date(), updatedAt: new Date() });

  groupForm = form(this.groupData, (schemaPath) => {
    debounce(schemaPath.name, 150);
    required(schemaPath.name);
  });

  errorMessage = signal('');
  saving = signal(false);

  toggleUser(index: number) {
    this.selectableUsers.update(value => {
      value[index].selected = !value[index].selected;
      return [...value];
    });
  }

  async save() {
    if (this.resourceData.hasValue()) {
      this.saving.set(true);
      this.errorMessage.set('');
      try {
        const currentUserId = this.currentUserService.user()!.id;
        const selectedUserIds = this.selectableUsers()
          .filter(u => u.selected)
          .map(u => u.userId);
        await this.groupStore.save({
          ...this.groupData(),
          users: [currentUserId, ...selectedUserIds],
        });
        this.router.navigate(['/groups']);
      } catch (e) {
        this.errorMessage.set(String(e));
      } finally {
        this.saving.set(false);
      }
    }
  }

}

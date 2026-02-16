import { Component, effect, inject, resource, signal, WritableSignal } from '@angular/core';
import { debounce, form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { EntityId } from '../../models/entity';
import { NewGroup } from '../../models/group';
import { CurrentUserService } from '../../services/current-user';
import { GroupStore } from '../../services/group-store';
import { UserStore } from '../../services/user-store';

interface SelectableUser {
  userId: EntityId;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'apezzi-group-create',
  imports: [FormField],
  templateUrl: './group-create.html',
  styleUrl: './group-create.scss',
})
export class GroupCreate {

  private currentUserService = inject(CurrentUserService);
  private groupStore = inject(GroupStore);
  private userStore = inject(UserStore);
  private router = inject(Router);

  protected groupData = signal<NewGroup>({ name: '', users: [], createdBy: '' });

  protected groupForm = form(this.groupData, (schemaPath) => {
    debounce(schemaPath.name, 150);
    required(schemaPath.name)
  });

  protected usersResource = resource({
    loader: () => this.userStore.findAll(),
  });

  protected selectableUsers: WritableSignal<SelectableUser[]> = signal([]);
  private selectableUsersInit = effect(() => {
    const currentUser = this.currentUserService.user();
    if (this.usersResource.hasValue() && currentUser) {
      const friendIds = new Set(currentUser.friends);
      this.selectableUsers.set(
        this.usersResource.value()!
          .filter(u => friendIds.has(u.id))
          .map(u => ({ userId: u.id, name: u.name, selected: false }))
      );
    }
  });

  protected errorMessage = signal('');
  protected saving = signal(false);

  protected toggleUser(index: number) {
    this.selectableUsers.update(value => {
      value[index].selected = !value[index].selected;
      return [...value];
    });
  }

  protected async save() {
    this.saving.set(true);
    this.errorMessage.set('');
    try {
      const currentUserId = this.currentUserService.user()!.id;
      const selectedUserIds = this.selectableUsers()
        .filter(u => u.selected)
        .map(u => u.userId);
      await this.groupStore.save({
        name: this.groupData().name,
        users: [currentUserId, ...selectedUserIds],
        createdBy: currentUserId,
      });
      this.router.navigate(['/groups']);
    } catch (e) {
      this.errorMessage.set(String(e));
    } finally {
      this.saving.set(false);
    }
  }

}

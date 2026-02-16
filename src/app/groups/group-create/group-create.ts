import { Component, inject, signal } from '@angular/core';
import { debounce, form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { NewGroup } from '../../models/group';
import { CurrentUserService } from '../../services/current-user';
import { GroupStore } from '../../services/group-store';

@Component({
  selector: 'apezzi-group-create',
  imports: [FormField],
  templateUrl: './group-create.html',
  styleUrl: './group-create.scss',
})
export class GroupCreate {

  private currentUserService = inject(CurrentUserService);
  private groupStore = inject(GroupStore);
  private router = inject(Router);

  protected groupData = signal<NewGroup>({ name: '', users: [], createdBy: '' });

  protected groupForm = form(this.groupData, (schemaPath) => {
    debounce(schemaPath.name, 150);
    required(schemaPath.name)
  });

  protected errorMessage = signal('');
  protected saving = signal(false);

  protected async save() {
    this.saving.set(true);
    this.errorMessage.set('');
    try {
      const currentUserId = this.currentUserService.user()!.id;
      await this.groupStore.save({
        name: this.groupData().name,
        users: [currentUserId],
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

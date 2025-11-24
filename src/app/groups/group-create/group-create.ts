import { Component, inject, signal } from '@angular/core';
import { Field, debounce, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { NewGroup } from '../../models/group';
import { GroupStore } from '../../services/group-store';

@Component({
  selector: 'apezzi-group-create',
  imports: [Field],
  templateUrl: './group-create.html',
  styleUrl: './group-create.scss',
})
export class GroupCreate {

  private groupStore = inject(GroupStore);
  private router = inject(Router);

  protected groupData = signal<NewGroup>({ name: '', users: [], createdBy: '' });

  protected groupForm = form(this.groupData, (schemaPath) => {
    debounce(schemaPath.name, 150);
    required(schemaPath.name)
  });

  protected save() {
    this.groupStore.save({
      name: this.groupData().name,
      users: [],
      createdBy: '',
    });
    this.router.navigate(['/groups']);
  }

}

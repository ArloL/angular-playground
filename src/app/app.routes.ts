import { Routes } from '@angular/router';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { GroupExpenses } from './groups/group-expenses/group-expenses';
import { GroupCreate } from './groups/group-create/group-create';
import { GroupEdit } from './groups/group-edit/group-edit';
import { GroupView } from './groups/group-view/group-view';
import { GroupsView } from './groups/groups-view/groups-view';
import { UsersView } from './users/users-view/users-view';

export const routes: Routes = [
  { path: 'users', component: UsersView },
  { path: 'groups', component: GroupsView },
  { path: 'group/create', component: GroupCreate },
  { path: 'group/:groupId', component: GroupView },
  { path: 'group/:groupId/edit', component: GroupEdit },
  { path: 'group/:groupId/expenses', component: GroupExpenses },
  { path: 'group/:groupId/expenses/add', component: AddExpenseComponent },
];

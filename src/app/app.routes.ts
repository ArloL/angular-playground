import { Routes } from '@angular/router';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { GroupExpenses } from './groups/group-expenses/group-expenses';
import { GroupCreate } from './groups/group-create/group-create';
import { GroupEdit } from './groups/group-edit/group-edit';

export const routes: Routes = [
  { path: 'group/:groupId/expenses/add', component: AddExpenseComponent },
  { path: 'group/create', component: GroupCreate },
  { path: 'group/:groupId/expenses', component: GroupExpenses },
  { path: 'group/:groupId/edit', component: GroupEdit },
];

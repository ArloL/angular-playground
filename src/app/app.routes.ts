import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { ExpenseCreate } from './expenses/expense-create/expense-create';
import { ExpenseEdit } from './expenses/expense-edit/expense-edit';
import { GroupExpenses } from './groups/group-expenses/group-expenses';
import { GroupCreate } from './groups/group-create/group-create';
import { GroupEdit } from './groups/group-edit/group-edit';
import { GroupView } from './groups/group-view/group-view';
import { GroupsView } from './groups/groups-view/groups-view';
import { CurrentUserService } from './services/current-user';
import { UserView } from './users/user-view/user-view';

const requireAuth = () => {
  return inject(CurrentUserService).user() ? true : inject(Router).createUrlTree(['/']);
};

const redirectToGroupsIfLoggedIn = () => {
  return inject(CurrentUserService).user() ? inject(Router).createUrlTree(['/groups']) : true;
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [redirectToGroupsIfLoggedIn], children: [] },
  { path: 'account', component: UserView, canActivate: [requireAuth] },
  { path: 'groups', component: GroupsView, canActivate: [requireAuth] },
  { path: 'group/create', component: GroupCreate, canActivate: [requireAuth] },
  { path: 'group/:groupId', component: GroupView, canActivate: [requireAuth] },
  { path: 'group/:groupId/edit', component: GroupEdit, canActivate: [requireAuth] },
  { path: 'group/:groupId/expenses', component: GroupExpenses, canActivate: [requireAuth] },
  { path: 'group/:groupId/expenses/add', component: ExpenseCreate, canActivate: [requireAuth] },
  { path: 'group/:groupId/expenses/:expenseId/edit', component: ExpenseEdit, canActivate: [requireAuth] },
];

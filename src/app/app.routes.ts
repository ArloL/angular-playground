import { Routes } from '@angular/router';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { GroupOverviewComponent } from './group-overview/group-overview.component';

export const routes: Routes = [
  { path: 'group/:groupId/add-expense', component: AddExpenseComponent },
  { path: 'group/:groupId', component: GroupOverviewComponent },
];

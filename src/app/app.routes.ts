import { Routes } from '@angular/router';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { GroupOverviewComponent } from './group-overview/group-overview.component';

export const routes: Routes = [
  { path: 'add-expense-component', component: AddExpenseComponent },
  { path: 'group-overview-component', component: GroupOverviewComponent },
];

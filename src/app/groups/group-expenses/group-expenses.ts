import { Component, computed, effect, inject, input } from '@angular/core';
import { ExpenseStore } from '../../services/expense-store';
import { formatNumber } from '../../helper/format-number';
import { GroupId } from '../../models/group';

@Component({
  selector: 'apezzi-group-expenses',
  standalone: true,
  imports: [],
  templateUrl: './group-expenses.html',
  styleUrl: './group-expenses.scss'
})
export class GroupExpenses {

  formatNumber = formatNumber;

  expenseStore = inject(ExpenseStore);

  readonly groupId = input.required<GroupId>();

}

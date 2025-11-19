import { Component, computed, effect, inject, input } from '@angular/core';
import { ExpenseStore } from '../services/expense-store';
import { formatNumber } from '../helper/format-number';
import { GroupId } from '../models/group';

@Component({
  selector: 'apezzi-group-overview',
  standalone: true,
  imports: [],
  templateUrl: './group-overview.component.html',
  styleUrl: './group-overview.component.scss'
})
export class GroupOverviewComponent {

  formatNumber = formatNumber;

  expenseStore = inject(ExpenseStore);

  groupId = input.required<GroupId>();

}

import { Component, inject, input, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpenseStore } from '../../services/expense-store';
import { formatNumber } from '../../helper/format-number';
import { EntityId } from '../../models/entity';

@Component({
  selector: 'apezzi-group-expenses',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './group-expenses.html',
  styleUrl: './group-expenses.scss',
})
export class GroupExpenses {
  formatNumber = formatNumber;

  expenseStore = inject(ExpenseStore);

  readonly groupId = input.required<EntityId>();

  expenses = resource({
    params: () => ({ id: this.groupId() }),
    loader: ({ params }) => this.expenseStore.findByGroupId(params.id),
  });
}

import { Component, inject, input, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpenseStore } from '../../services/expense-store';
import { formatNumber } from '../../helper/format-number';
import { EntityId } from '../../models/entity';

@Component({
  selector: 'apezzi-group-expenses',
  imports: [RouterLink],
  templateUrl: './group-expenses.html',
  styleUrl: './group-expenses.scss',
})
export class GroupExpenses {
  protected formatNumber = formatNumber;

  private expenseStore = inject(ExpenseStore);

  public readonly groupId = input.required<EntityId>();

  protected expenses = resource({
    params: () => ({ id: this.groupId() }),
    loader: ({ params }) => this.expenseStore.findByGroupId(params.id),
  });
}

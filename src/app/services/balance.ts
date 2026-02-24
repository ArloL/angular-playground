import { Injectable } from '@angular/core';
import { EntityId } from '../models/entity';
import { Expense } from '../models/expense';

export interface PairwiseBalance {
  from: EntityId; // debtor
  to: EntityId; // creditor
  amount: number; // cents, positive
}

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  public computePairwiseBalances(expenses: Expense[]): PairwiseBalance[] {
    // balance[debtor][creditor] = gross amount owed
    const balance = new Map<EntityId, Map<EntityId, number>>();

    const add = (debtor: EntityId, creditor: EntityId, amount: number) => {
      if (!balance.has(debtor)) balance.set(debtor, new Map());
      const row = balance.get(debtor)!;
      row.set(creditor, (row.get(creditor) ?? 0) + amount);
    };

    for (const expense of expenses) {
      const payer = expense.createdBy;
      for (const share of expense.shares) {
        if (share.included && share.userId !== payer) {
          add(share.userId, payer, share.owed);
        }
      }
    }

    // Simplify: netBalance[A][B] = balance[A][B] - balance[B][A]
    const result: PairwiseBalance[] = [];
    const seen = new Set<string>();

    for (const [from, creditors] of balance) {
      for (const [to] of creditors) {
        const key = [from, to].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);

        const aOwesB = balance.get(from)?.get(to) ?? 0;
        const bOwesA = balance.get(to)?.get(from) ?? 0;
        const net = aOwesB - bOwesA;

        if (net > 0) {
          result.push({ from, to, amount: net });
        } else if (net < 0) {
          result.push({ from: to, to: from, amount: -net });
        }
      }
    }

    return result;
  }
}

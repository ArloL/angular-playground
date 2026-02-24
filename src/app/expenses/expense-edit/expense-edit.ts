import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  resource,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { customParseFloat } from '../../helper/custom-parse-float';
import { randomNumberBetweenZeroAndMax } from '../../helper/random-numbers';
import { ExpenseStore } from '../../services/expense-store';
import { EntityId } from '../../models/entity';
import { Router } from '@angular/router';
import { categories, currencies, Expense } from '../../models/expense';
import { formatNumber } from '../../helper/format-number';
import { Share, ShareRaw } from '../../models/share';
import { UserStore } from '../../services/user-store';
import { PlainDateLike } from '../../models/plain-date-like';

@Component({
  selector: 'apezzi-expense-edit',
  imports: [],
  templateUrl: './expense-edit.html',
  styleUrl: './expense-edit.scss',
})
export class ExpenseEdit {
  public readonly groupId = input.required<EntityId>();
  public readonly expenseId = input.required<EntityId>();

  private injector = inject(Injector);
  private userStore = inject(UserStore);
  private expenseStore = inject(ExpenseStore);
  private router = inject(Router);

  private categoryButtons =
    viewChild<ElementRef<HTMLElement>>('categoryButtons');

  protected formatNumber = formatNumber;
  protected currencies = currencies;
  public categories = categories;

  protected selectedCurrency = 0;
  public selectedCategory = signal(0);

  public costRaw = signal('');
  public descriptionRaw = signal('');
  protected dateRaw = signal('');

  protected resourceData = resource({
    params: () => ({ id: this.expenseId() }),
    loader: async ({ params }) => {
      const expense = await this.expenseStore.findById(params.id);
      const users = await this.userStore.findByIds(
        expense.shares.map((s) => s.userId),
      );
      const userNames = new Map<EntityId, string>();
      users.forEach((u) => userNames.set(u.id, u.name));
      return { expense, userNames };
    },
  });

  private expenseLoadEffect = effect(() => {
    if (this.resourceData.hasValue()) {
      this.costRaw.set(formatNumber(this.resourceData.value().expense.cost));
      this.descriptionRaw.set(this.resourceData.value().expense.description);
      this.dateRaw.set(this.resourceData.value().expense.date.toInputValue());
      this.selectedCategory.set(
        this.categories.indexOf(this.resourceData.value().expense.category),
      );
      afterNextRender(
        () => {
          const container = this.categoryButtons()?.nativeElement;
          const selected = container?.querySelector('.is-selected');
          if (selected && 'scrollIntoView' in selected) {
            selected.scrollIntoView({ block: 'nearest', inline: 'center' });
          }
        },
        { injector: this.injector },
      );
    }
  });

  public expenseData: Signal<Expense> = computed(() => {
    if (!this.resourceData.hasValue()) {
      return {
        id: '',
        cost: 0,
        description: '',
        currency: '',
        category: '',
        date: PlainDateLike.now(),
        shares: [],
        createdBy: '',
        groupId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return {
      ...this.resourceData.value()?.expense,
      cost: customParseFloat(this.costRaw()),
      description: this.descriptionRaw(),
      category: this.categories[this.selectedCategory()],
      date: PlainDateLike.fromInputValue(this.dateRaw()),
    };
  });

  protected sharesRaw: WritableSignal<ShareRaw[]> = signal([]);
  private sharesRawInitialize = effect(() => {
    if (this.resourceData.hasValue()) {
      this.sharesRaw.set(
        this.resourceData.value()?.expense.shares.map((share) => {
          return {
            userId: share.userId,
            owed: '',
            included: share.included,
          };
        }),
      );
    }
  });

  protected shares: Signal<Share[]> = computed(() => {
    const numberOfIncludedShares = this.sharesRaw().filter(
      (s) => s.included,
    ).length;
    const amountManuallyDistributed = this.sharesRaw()
      .filter((s) => s.included)
      .map((s) => customParseFloat(s.owed))
      .reduce((a, b) => a + b, 0);
    const amountToDistributeAutomatically = Math.max(
      0,
      this.expenseData().cost - amountManuallyDistributed,
    );
    const numberOfComputedShares = this.sharesRaw()
      .filter((s) => s.included)
      .filter((s) => s.owed === '').length;
    let whichIndexGetsTheRemainder = randomNumberBetweenZeroAndMax(
      numberOfComputedShares,
    );
    let automaticallyDistributedAmount: number;
    let remainderForExactDistribution: number;
    if (numberOfIncludedShares === 0) {
      automaticallyDistributedAmount = 0;
      remainderForExactDistribution = 0;
    } else if (numberOfIncludedShares === 1) {
      automaticallyDistributedAmount = this.expenseData().cost;
      remainderForExactDistribution = this.expenseData().cost;
    } else {
      automaticallyDistributedAmount = Math.round(
        amountToDistributeAutomatically / numberOfComputedShares,
      );
      remainderForExactDistribution = Math.round(
        amountToDistributeAutomatically -
          automaticallyDistributedAmount * (numberOfComputedShares - 1),
      );
    }
    return this.sharesRaw().map((shareRaw) => {
      const share: Share = {
        userId: shareRaw.userId,
        included: shareRaw.included,
        owed: customParseFloat(shareRaw.owed),
      };
      if (shareRaw.included && shareRaw.owed === '') {
        if (whichIndexGetsTheRemainder === 0) {
          share.owed = remainderForExactDistribution;
        } else {
          share.owed = automaticallyDistributedAmount;
        }
        whichIndexGetsTheRemainder--;
      }
      return share;
    });
  });

  protected saveEnabled = computed(() => {
    const sumOfShares = this.shares()
      .filter((s) => s.included)
      .map((s) => s.owed)
      .reduce((a, b) => a + b, 0);
    return (
      this.expenseData().cost > 0 && sumOfShares === this.expenseData().cost
    );
  });

  protected errorMessage = signal('');
  protected saving = signal(false);

  protected async save() {
    if (this.resourceData.hasValue()) {
      this.saving.set(true);
      this.errorMessage.set('');
      try {
        const data = { ...this.expenseData(), shares: this.shares() };
        await this.expenseStore.save(data);
        this.router.navigate(['/group', this.groupId(), 'expenses']);
      } catch (e) {
        this.errorMessage.set(String(e));
      } finally {
        this.saving.set(false);
      }
    }
  }

  protected toggleIncluded(index: number) {
    this.sharesRaw.update((value) => {
      value[index].included = !value[index].included;
      return [...value];
    });
  }

  protected updateShareOwed(index: number, owed: string) {
    this.sharesRaw.update((value) => {
      value[index].owed = owed;
      return [...value];
    });
  }
}

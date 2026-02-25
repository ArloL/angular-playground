import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  resource,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { formatNumber } from '../../helper/format-number';
import { customParseFloat } from '../../helper/custom-parse-float';
import { randomNumberBetweenZeroAndMax } from '../../helper/random-numbers';
import { EntityId } from '../../models/entity';
import { categories, currencies, NewExpense } from '../../models/expense';
import { Share, ShareRaw } from '../../models/share';
import { CurrentUserService } from '../../services/current-user';
import { ExpenseStore } from '../../services/expense-store';
import { GroupStore } from '../../services/group-store';
import { UserStore } from '../../services/user-store';
import { PlainDateLike } from '../../models/plain-date-like';

@Component({
  selector: 'apezzi-expense-create',
  templateUrl: './expense-create.html',
  styleUrl: './expense-create.scss',
})
export class ExpenseCreate {
  private currentUserService = inject(CurrentUserService);
  private expenseStore = inject(ExpenseStore);
  private groupStore = inject(GroupStore);
  private userStore = inject(UserStore);
  private router = inject(Router);

  protected formatNumber = formatNumber;
  protected currencies = currencies;
  protected categories = categories;

  public readonly groupId = input.required<EntityId>();
  public readonly navigateAfterSave = input(true);
  public readonly expenseSaved = output<void>();

  protected resourceData = resource({
    params: () => ({ id: this.groupId() }),
    loader: async ({ params }) => {
      const group = await this.groupStore.findById(params.id);
      const users = await this.userStore.findByIds(group.users);
      const userNames = new Map<EntityId, string>();
      users.forEach((u) => userNames.set(u.id, u.name));
      return { group, userNames };
    },
  });

  protected selectedCurrency = 0;
  protected selectedCategory = signal(0);

  public costRaw = signal('');
  protected descriptionRaw = signal('');
  protected dateRaw = signal(PlainDateLike.now().toInputValue());
  protected selectedPayerId = signal<EntityId | null>(null);
  protected payerIdComputed = computed(
    () => this.selectedPayerId() ?? this.currentUserService.user()?.id ?? null,
  );
  protected isPersonalContext = computed(
    () => (this.resourceData.value()?.group?.users?.length ?? 0) <= 1,
  );

  protected expense: Signal<NewExpense> = computed(() => {
    return {
      cost: customParseFloat(this.costRaw()),
      description: this.descriptionRaw(),
      currency: '€',
      category: this.categories[this.selectedCategory()],
      date: PlainDateLike.fromInputValue(this.dateRaw()),
      shares: [],
      createdBy: this.payerIdComputed()!,
      groupId: this.groupId(),
    };
  });

  public saveEnabled = computed(() => {
    const sumOfShares = this.shares()
      .filter((s) => s.included)
      .map((s) => s.owed)
      .reduce((a, b) => a + b, 0);
    return this.expense().cost > 0 && sumOfShares === this.expense().cost;
  });

  protected sharesRaw: WritableSignal<ShareRaw[]> = signal([]);
  private sharesRawInitialize = effect(() => {
    if (this.resourceData.hasValue()) {
      this.selectedPayerId.set(null);
      this.sharesRaw.set(
        this.resourceData.value()?.group.users.map((userId) => {
          return {
            userId: userId,
            owed: '',
            included: true,
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
      this.expense().cost - amountManuallyDistributed,
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
      automaticallyDistributedAmount = this.expense().cost;
      remainderForExactDistribution = this.expense().cost;
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

  protected errorMessage = signal('');
  protected saving = signal(false);

  protected async save() {
    this.saving.set(true);
    this.errorMessage.set('');
    try {
      await this.expenseStore.save({
        ...this.expense(),
        shares: this.shares(),
      });
      if (this.navigateAfterSave()) {
        this.router.navigate(['/group', this.groupId(), 'expenses']);
      } else {
        this.costRaw.set('');
        this.descriptionRaw.set('');
        this.expenseSaved.emit();
      }
    } catch (e) {
      this.errorMessage.set(String(e));
    } finally {
      this.saving.set(false);
    }
  }

  protected reset() {
    this.costRaw.set('');
    this.descriptionRaw.set('');
    this.selectedCategory.set(0);
  }

  protected toggleIncluded(index: number) {
    this.sharesRaw.update((value) => {
      value[index].included = !value[index].included;
      return [...value];
    });
  }

  public updateShareOwed(index: number, owed: string) {
    this.sharesRaw.update((value) => {
      value[index].owed = owed;
      return [...value];
    });
  }

  protected setPayerFromEvent(event: Event) {
    this.selectedPayerId.set((event.target as HTMLSelectElement).value);
  }
}

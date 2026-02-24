export class PlainDateLike {
  readonly year: number;
  readonly month: number; // 1–12
  readonly day: number; // 1–31

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  static fromDate(date: Date): PlainDateLike {
    return this.fromInputValue(date.toISOString().split('T')[0]);
  }

  static fromInputValue(value: string): PlainDateLike {
    const [year, month, day] = value.split('-').map(Number);
    return new PlainDateLike(year, month, day);
  }

  static now(): PlainDateLike {
    const d = new Date();
    return new PlainDateLike(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate(),
    );
  }

  toDate(): Date {
    // Returns a Date at UTC midnight
    return new Date(Date.UTC(this.year, this.month - 1, this.day));
  }

  toInputValue(): string {
    const m = String(this.month).padStart(2, '0');
    const d = String(this.day).padStart(2, '0');
    return `${this.year}-${m}-${d}` as `${number}-${number}-${number}`;
  }

  toString(): string {
    const m = String(this.month).padStart(2, '0');
    const d = String(this.day).padStart(2, '0');
    return `${this.year}-${m}-${d}` as `${number}-${number}-${number}`;
  }
}

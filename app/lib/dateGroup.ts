/**
 * Bucket items into time-relative groups for the history view.
 * "This week" runs Mon–Sun (Korean convention works either way; we use Mon).
 */

export type DateGroupKey = string;

interface Bucketed<T> {
  key: DateGroupKey;
  label: string;
  items: T[];
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeekMonday(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Group items by their date into:
 *   - "이번 주"
 *   - "지난 주"
 *   - "이번 달" (the rest of current month, excluding this/last week)
 *   - "YYYY년 M월" for older months
 */
export function groupByRelativeDate<T>(
  items: T[],
  getDate: (item: T) => string | Date
): Bucketed<T>[] {
  const now = new Date();
  const thisWeekStart = startOfWeekMonday(now).getTime();
  const lastWeekStart = thisWeekStart - 7 * 24 * 60 * 60 * 1000;
  const thisMonthStart = startOfMonth(now).getTime();

  // Preserve order by inserting buckets as we encounter them.
  const order: DateGroupKey[] = [];
  const map = new Map<DateGroupKey, Bucketed<T>>();

  const ensure = (key: DateGroupKey, label: string) => {
    let b = map.get(key);
    if (!b) {
      b = { key, label, items: [] };
      map.set(key, b);
      order.push(key);
    }
    return b;
  };

  for (const item of items) {
    const ts = new Date(getDate(item)).getTime();
    if (Number.isNaN(ts)) continue;

    let key: DateGroupKey;
    let label: string;

    if (ts >= thisWeekStart) {
      key = "this-week";
      label = "이번 주";
    } else if (ts >= lastWeekStart) {
      key = "last-week";
      label = "지난 주";
    } else if (ts >= thisMonthStart) {
      key = "this-month";
      label = "이번 달";
    } else {
      const d = new Date(ts);
      key = `m-${d.getFullYear()}-${d.getMonth()}`;
      label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    }
    ensure(key, label).items.push(item);
  }

  return order.map((k) => map.get(k)!).filter((b) => b.items.length > 0);
}

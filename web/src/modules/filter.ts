import { shallowReactive, computed } from 'vue';
import { Tag, Expense, Data, Date } from 'common';

import { myReactive } from '@/main';

export interface Filter {
  exact: boolean;
  include: Set<Tag>;
  exclude: Set<Tag>;
  before: Date | null;
  after: Date | null;
  match: (e: Expense) => boolean;
  result: Expense[];
}

export function initFilter(data: Data): Filter {
  const filter: Filter = myReactive({
    exact: false,
    include: shallowReactive(new Set()),
    exclude: shallowReactive(new Set()),
    before: null,
    after: null,

    match: (e: Expense) => {
      return ([...filter.include].every(t => e.tags.has(t)))
        && ([...filter.exclude].every(t => !e.tags.has(t)))
        && (!filter.exact || e.tags.size == filter.include.size)
        && (filter.before == null || Date.lt(e.transaction.date, filter.before) || Date.eq(e.transaction.date, filter.before))
        && (filter.after == null || Date.lt(filter.after, e.transaction.date) || Date.eq(filter.after, e.transaction.date));
    },
    result: computed(() => {
      return data.expenses.filter(e => filter.match(e));
    }),
  });

  return filter;
}

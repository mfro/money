import { Chart, registerables } from 'chart.js';
import csv from 'csv-parse/lib/sync'
import { computed, ComputedRef, createApp, shallowReactive, shallowRef, watchEffect } from 'vue'
import { framework } from '@mfro/vue-ui'
import { assert } from '@mfro/ts-common/assert';

import App from './main.vue'
import * as storage from './storage';
import { Tag, Money, Expense, Data, Date } from 'common';

// const rawData = require('/home/mfro/home/Downloads/money - raw.csv').default;

Chart.register(...registerables);

export interface Cache {
  byTag(tag: Tag): { total: Money };
  byTagFiltered(tag: Tag): { total: Money };
}

export interface Filter {
  exact: boolean;
  include: Set<Tag>;
  exclude: Set<Tag>;
  before: Date | null;
  after: Date | null;
  match: (e: Expense) => boolean;
  result: Expense[];
}

const money: Data = {
  tags: shallowReactive([]),
  expenses: shallowReactive([]),
  transactions: shallowReactive([]),
};

storage.load(money);

for (const t of money.transactions) {
  if (money.expenses.find(e => e.transaction == t)) continue;
  money.expenses.push({ transaction: t, tags: new Set(), details: '' });
}

for (let i = 0; i < money.expenses.length; ++i) {
  money.expenses[i].tags = shallowReactive(money.expenses[i].tags);
  money.expenses[i] = shallowReactive(money.expenses[i]);
}

watchEffect(() => {
  storage.save(money);
});

const filter: Filter = shallowReactive({
  exact: false,
  include: shallowReactive(new Set()),
  exclude: shallowReactive(new Set()),
  before: null,
  after: null,

  match: (e) => {
    return ([...filter.include].every(t => e.tags.has(t)))
      && ([...filter.exclude].every(t => !e.tags.has(t)))
      && (!filter.exact || e.tags.size == filter.include.size)
      && (filter.before == null || Date.lt(e.transaction.date, filter.before) || Date.eq(e.transaction.date, filter.before))
      && (filter.after == null || Date.lt(filter.after, e.transaction.date) || Date.eq(filter.after, e.transaction.date));
  },
  result: [],
});

watchEffect(() => filter.result = money.expenses.filter(e => filter.match(e)));

const cacheData = {
  byTag: computed(() => {
    const map = new Map();
    for (const expense of money.expenses) {
      for (const tag of expense.tags) {
        let entry = map.get(tag);
        if (!entry) map.set(tag, entry = { total: { cents: 0 } });
        entry.total.cents += expense.transaction.value.cents;
      }
    }
    return map;
  }),

  byTagFiltered: computed(() => {
    const map = new Map();
    for (const expense of filter.result) {
      for (const tag of expense.tags) {
        let entry = map.get(tag);
        if (!entry) map.set(tag, entry = { total: { cents: 0 } });
        entry.total.cents += expense.transaction.value.cents;
      }
    }
    return map;
  }),
};

const cache: Cache = {
  byTag: (tag) => cacheData.byTag.value.get(tag) ?? { total: { cents: 0 } },
  byTagFiltered: (tag) => cacheData.byTagFiltered.value.get(tag) ?? { total: { cents: 0 } },
};

const app = createApp(App, {
  money,
  cache,
  filter
});

app.use(framework);

app.mount('#app');

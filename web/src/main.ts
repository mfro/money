import { Chart, registerables } from 'chart.js';
import csv from 'csv-parse/lib/sync'
import { computed, ComputedRef, createApp, Ref, shallowReactive, shallowRef, watchEffect } from 'vue'
import { framework } from '@mfro/vue-ui'

import { Tag, Money, Expense, Data, Date } from 'common';

import App from './main.vue'
import * as backend from './backend';
import * as storage from './storage';

const content: Ref<string | null> = shallowRef(null);

async function test() {
  // const clientSecret = 'jgcyyRgeE1Fnvnv4n0TvNlCI';

  // gapi.load('client:auth2', async () => {
  //   await gapi.client.init({
  //     scope: 'https://www.googleapis.com/auth/drive',
  //     clientId: '512069470809-l4ukcrbu8o9mt8bf0p4u3g9hqvgsjji5.apps.googleusercontent.com',
  //     discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  //   });

  //   const auth = gapi.auth2.getAuthInstance();

  //   const user = await auth.signIn();

  //   const response = await gapi.client.drive.files.get({
  //     fileId: '12blVzVR0E0m-7LWgSl3Clzot549v2dYX',
  //     alt: 'media',
  //   });
  // });

  const raw = await backend.load('money');
  content.value = raw && raw.toString('utf8');

  storage.load2(money, content.value);

  for (const t of money.transactions) {
    if (money.expenses.find(e => e.transaction == t)) continue;
    money.expenses.push({ transaction: t, tags: new Set(), details: '' });
  }

  for (let i = 0; i < money.expenses.length; ++i) {
    money.expenses[i].tags = shallowReactive(money.expenses[i].tags);
    money.expenses[i] = shallowReactive(money.expenses[i]);
  }
}

test();

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

const json = computed(() => {
  return storage.save2(money);
});

const hasChanges = computed(() => {
  return json.value != content.value;
});

const app = createApp(App, {
  money,
  cache,
  filter,
  hasChanges,
  save() {
    content.value = json.value;
    backend.save(Buffer.from(json.value, 'utf8'));
  },
});

app.use(framework);

app.mount('#app');

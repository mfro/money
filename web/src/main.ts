import { Chart, registerables } from 'chart.js';
import csv from 'csv-parse/lib/sync'
import { ComputedRef, createApp, shallowReactive, watchEffect } from 'vue'
import { framework } from '@mfro/vue-ui'
import { assert } from '@mfro/ts-common/assert';

import App from './main.vue'
import * as storage from './storage';
import { Tag, Money, Expense, Data } from 'common';

const rawData = require('/home/mfro/home/Downloads/money - raw.csv').default;

export interface Cache {
  byTag(tag: Tag): { total: Money };
  byTagFiltered(tag: Tag): { total: Money };
}

export interface Filter {
  include: Set<Tag>;
  exclude: Set<Tag>;
  result: ComputedRef<Expense[]>;
}

Chart.register(...registerables);

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

const app = createApp(App, {
  money,

  async load(file: File, canvas: HTMLCanvasElement, filter: Filter, cache: Cache) {
    // const text = await file.text();

    // const rows: string[][] = csv(rawData, {
    //   from_line: 2,
    // });

    // const loaded = rows.map(row => Transaction.load(row));
    // money.transactions.push(...loaded);
    let chart: Chart | undefined;

    watchEffect(() => {
      chart?.destroy();

      const context = canvas.getContext('2d');
      assert(context != null, 'context');

      const src = money.tags
        .filter(tag => !filter.include.has(tag))
        .map(t => [t, cache.byTagFiltered(t)] as const)
        .filter(([tag, info]) => info.total.cents != 0)
        .map(([tag, info]) => [tag.value, -info.total.cents / 100] as const)
        .sort((a, b) => b[1] - a[1]);

      const labels = src.map(v => v[0]);
      const data = src.map(v => v[1]);

      const bounds = canvas.getBoundingClientRect()

      chart = new Chart(context, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'money',
            data,
            backgroundColor: [
              // '#a50026',
              // '#d73027',
              // '#f46d43',
              // '#fdae61',
              // '#fee08b',
              // '#ffffbf',
              // '#d9ef8b',
              // '#a6d96a',
              // '#66bd63',
              '#1a9850',
              // '#006837',
            ],
          }],
        },
        options: {
          aspectRatio: bounds.width / bounds.height,
          indexAxis: 'y',
        },
      });
    });
  },
});

app.use(framework);

app.mount('#app');

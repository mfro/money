import { Chart } from 'chart.js';
import { Ref, watchEffect } from 'vue';
import { assert } from '@mfro/ts-common/assert';

import { Data } from 'common';
import { Filter, Cache } from './main';

export type GraphType = 'tag' | 'date';

export async function initGraph(canvas: Ref<HTMLCanvasElement>, type: Ref<GraphType>, money: Data, filter: Filter, cache: Cache) {
  let chart: Chart<any> | undefined;

  watchEffect(() => {
    chart?.destroy();

    if (!canvas.value || !type.value) return;

    const bounds = canvas.value.getBoundingClientRect()
    const context = canvas.value.getContext('2d');
    assert(context != null, 'context');

    if (type.value == 'tag') {
      const src = money.tags
        .filter(tag => !filter.include.has(tag))
        .map(t => [t, cache.byTagFiltered(t)] as const)
        .filter(([tag, info]) => info.total.cents != 0)
        .map(([tag, info]) => [tag.value, -info.total.cents / 100] as const)
        .sort((a, b) => b[1] - a[1]);

      const labels = src.map(v => v[0]);
      const data = src.map(v => v[1]);

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
    } else {
      const months = new Map<string, { date: Date, value: number }>();
      // const src = money.tags
      //   .filter(tag => !filter.include.has(tag))
      //   .map(t => [t, cache.byTagFiltered(t)] as const)
      //   .filter(([tag, info]) => info.total.cents != 0)
      //   .map(([tag, info]) => [tag.value, -info.total.cents / 100] as const)
      //   .sort((a, b) => b[1] - a[1]);

      for (const expense of filter.result) {
        const date = new Date(expense.transaction.date.year, expense.transaction.date.month - 1, expense.transaction.date.day);
        const month = date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        let info = months.get(month);
        if (!info) months.set(month, info = { date, value: 0 });

        info.value -= expense.transaction.value.cents;
      }

      const src = [...months].sort((a, b) => a[1].date.valueOf() - b[1].date.valueOf());

      const labels = src.map(v => v[0]);
      const data = src.map(v => v[1].value / 100);

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
    }
  });
}

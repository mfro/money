import csv from 'csv-parse/lib/sync'
import { createApp, proxyRefs, shallowReactive, ShallowUnwrapRef } from 'vue'
import { framework } from '@mfro/vue-ui'

import { Data } from 'common';

import App from './main.vue'

import { initStorage } from './app/storage';
import { initFilter } from './app/filter';
import { initCache } from './app/cache';
import { initGraph } from './app/graph';

export function myReactive<T extends object>(arg: T): ShallowUnwrapRef<T> {
  return shallowReactive(proxyRefs(arg));
}

const data: Data = {
  tags: shallowReactive([]),
  expenses: shallowReactive([]),
  transactions: shallowReactive([]),
};

const storage = initStorage(data);
const filter = initFilter(data);
const cache = initCache(data, filter);
const graph = initGraph(data, filter, cache);

const app = createApp(App);

app.use(framework);

app.provide('data', data);
app.provide('storage', storage);
app.provide('filter', filter);
app.provide('cache', cache);
app.provide('graph', graph);

app.mount('#app');

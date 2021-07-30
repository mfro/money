import { createApp, proxyRefs, shallowReactive, ShallowUnwrapRef } from 'vue'
import { framework } from '@mfro/vue-ui'

import { Data } from 'common';

import App from './main.vue'

import { initStorage, StorageState } from './modules/storage';
import { initFilter } from './modules/filter';
import { initCache } from './modules/cache';
import { initGraph } from './modules/graph';
import { initImport } from './modules/import';

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
const imports = initImport(data);

const app = createApp(App);

app.use(framework);

app.provide('data', data);
app.provide('storage', storage);
app.provide('filter', filter);
app.provide('cache', cache);
app.provide('graph', graph);
app.provide('import', imports);

app.mount('#app');

window.addEventListener('beforeunload', e => {
  if (storage.state == StorageState.changed || storage.state == StorageState.saving) {
    e.preventDefault();
    e.returnValue = '';
  }
});

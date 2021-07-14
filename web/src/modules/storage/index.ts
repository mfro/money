import { Data } from 'common';
import { computed, shallowReactive, shallowRef } from 'vue';

import { myReactive } from '@/main';

import * as github from './github';
import * as serialization from './serialization';

export enum StorageState {
  none,
  loading,
  changed,
  saving,
}

export interface Storage {
  state: StorageState;
  save(): Promise<void>;
}

export function initStorage(data: Data) {
  const json = computed(() => serialization.save(data));
  const content = shallowRef(null as null | string);
  const loading = shallowRef(true);

  const storage: Storage = myReactive({
    state: computed(() =>
      loading.value
        ? content.value == null
          ? StorageState.loading
          : StorageState.saving
        : content.value == json.value
          ? StorageState.none
          : StorageState.changed
    ),
    save: async () => {
      loading.value = true;

      content.value = json.value;
      await github.save(Buffer.from(json.value, 'utf8'));

      loading.value = false;
    },
  });

  (async () => {
    const raw = await github.load('money');
    content.value = raw && raw.toString('utf8');

    serialization.load(data, content.value);

    for (const t of data.transactions) {
      if (data.expenses.find(e => e.transaction == t)) continue;
      data.expenses.push({ transaction: t, tags: new Set(), details: '' });
    }

    for (let i = 0; i < data.expenses.length; ++i) {
      data.expenses[i].tags = shallowReactive(data.expenses[i].tags);
      data.expenses[i] = shallowReactive(data.expenses[i]);
    }

    loading.value = false;
  })();

  return storage;
}

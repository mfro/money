import { Data } from 'common';
import { computed, shallowReactive } from 'vue';

import { myReactive } from '@/main';

import * as github from './github';
import * as serialization from './serialization';

export interface Storage {
  json: string;
  changes: boolean;
  content: string | null;
  save(): Promise<void>;
}

export function initStorage(data: Data) {
  const storage: Storage = myReactive({
    json: computed(() => serialization.save(data)),
    changes: computed(() => storage.json != storage.content),
    content: null,
    save: async () => {
      storage.content = storage.json;
      await github.save(Buffer.from(storage.json, 'utf8'));
    },
  });

  (async () => {
    const raw = await github.load('money');
    storage.content = raw && raw.toString('utf8');

    serialization.load(data, storage.content);

    for (const t of data.transactions) {
      if (data.expenses.find(e => e.transaction == t)) continue;
      data.expenses.push({ transaction: t, tags: new Set(), details: '' });
    }

    for (let i = 0; i < data.expenses.length; ++i) {
      data.expenses[i].tags = shallowReactive(data.expenses[i].tags);
      data.expenses[i] = shallowReactive(data.expenses[i]);
    }
  })();

  return storage;
}

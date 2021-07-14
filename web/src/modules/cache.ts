import { computed } from 'vue';
import { Data, Money, Tag } from 'common';

import { Filter } from './filter';

export interface Cache {
  byTag(tag: Tag): { total: Money };
  byTagFiltered(tag: Tag): { total: Money };
}

export function initCache(data: Data, filter: Filter): Cache {
  const byTag = computed(() => {
    const map = new Map();
    for (const expense of data.expenses) {
      for (const tag of expense.tags) {
        let entry = map.get(tag);
        if (!entry) map.set(tag, entry = { total: { cents: 0 } });
        entry.total.cents += expense.transaction.value.cents;
      }
    }
    return map;
  });

  const byTagFiltered = computed(() => {
    const map = new Map();
    for (const expense of filter.result) {
      for (const tag of expense.tags) {
        let entry = map.get(tag);
        if (!entry) map.set(tag, entry = { total: { cents: 0 } });
        entry.total.cents += expense.transaction.value.cents;
      }
    }
    return map;
  });

  return {
    byTag: (tag) => byTag.value.get(tag) ?? { total: { cents: 0 } },
    byTagFiltered: (tag) => byTagFiltered.value.get(tag) ?? { total: { cents: 0 } },
  };
}

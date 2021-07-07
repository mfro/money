<template>
  <v-flex column>
    <tag-index-entry
      v-for="tag in tags"
      :key="tag"
      :tag="tag"
      :editing="editing"
    />

    <v-flex
      class="pa-2"
      v-if="filter.include.size > 0 || filter.exclude.size > 0"
      align-center
    >
      <span class="mr-3">
        {{ filter.include.size + filter.exclude.size }} selected
      </span>

      <v-button small @click="filter.include.clear(), filter.exclude.clear()">
        clear
      </v-button>
    </v-flex>

    <v-flex align-center class="ma-2">
      <v-text-field
        v-model="input"
        @keydown="$event.keyCode == 13 && submit()"
        class="mt-0 mr-2"
      />

      <v-button icon @click="submit()">
        <v-icon>add</v-icon>
      </v-button>
    </v-flex>
  </v-flex>
</template>

<script>
import { computed, inject, shallowReactive, shallowRef } from 'vue';

import TagIndexEntry from './tag-index-entry';

export default {
  name: 'tags',
  components: {
    TagIndexEntry,
  },

  props: {
    editing: Object,
  },

  setup() {
    const input = shallowRef('');

    const money = inject('money');
    const cache = inject('cache');
    const filter = inject('filter');

    const tags = computed(() => {
      return [...money.tags].sort((a, b) => {
        const aTotal = cache.byTag(a).total;
        const bTotal = cache.byTag(b).total;

        if (aTotal.cents != bTotal.cents)
          return aTotal.cents - bTotal.cents;

        return a.value.localeCompare(b.value);
      });
    });

    return {
      tags,
      input,
      filter,

      submit() {
        const tag = { value: input.value };
        money.tags.push(tag);

        input.value = '';
      },
    };
  },
};
</script>

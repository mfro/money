<template>
  <v-flex align-center class="tag">
    <v-flex>
      <v-button
        text
        x-small
        @click="toggle('include')"
        @contextmenu.prevent="toggle('exclude')"
        :color="
          filter.include.has(tag)
            ? 'green'
            : filter.exclude.has(tag)
            ? 'error'
            : 'default'
        "
      >
        <v-text>{{ tag.value }}</v-text>
      </v-button>
    </v-flex>

    <v-flex grow />

    <money :value="total" class="mr-1" />

    <template v-if="editing.size > 0">
      <v-button x-small icon class="mr-1" @click="toggleEdit()">
        <v-icon v-if="removeTag">remove</v-icon>
        <v-icon v-else>add</v-icon>
      </v-button>
    </template>
  </v-flex>
</template>

<script>
import { computed, inject, shallowReactive, shallowRef } from 'vue';

import Money from '../money';

export default {
  name: 'tag-list-entry',
  components: {
    Money,
  },

  props: {
    tag: Object,
    editing: Object,
  },

  setup(props) {
    const money = inject('money');
    const cache = inject('cache');
    const filter = inject('filter');

    const total = computed(() => {
      return cache.byTag(props.tag).total;
    });

    const removeTag = computed(() => {
      return [...props.editing].every((e) => e.tags.has(props.tag))
    });

    return {
      total,
      filter,
      removeTag,

      toggleEdit() {
        const removing = removeTag.value;
        for (const expense of props.editing) {
          if (removing) expense.tags.delete(props.tag);
          else expense.tags.add(props.tag);
        }
      },

      toggle(key) {
        if (filter[key].has(props.tag))
          filter[key].delete(props.tag);
        else
          filter[key].add(props.tag);
      },

      del() {
        const index = money.tags.indexOf(props.tag);
        money.tags.splice(index, 1);
      },
    };
  },
};
</script>

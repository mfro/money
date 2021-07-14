<template>
  <v-flex
    class="expense py-1 px-2"
    v-ripple
    v-show="visible"
    :class="{ active: editing.has(expense) }"
    @click="
      editing.has(expense) ? editing.delete(expense) : editing.add(expense)
    "
  >
    <v-flex justify-start align-center class="date">
      <date :value="expense.transaction.date" />
    </v-flex>

    <v-flex justify-end align-center class="money">
      <money :value="expense.transaction.value" />
    </v-flex>

    <v-flex justify-start align-center class="tags px-2">
      <v-button text x-small v-for="tag in expense.tags" :key="tag">
        {{ tag.value }}
      </v-button>
    </v-flex>

    <v-flex justify-start align-center class="description">
      <span style="font-family: Roboto Mono; font-size: 0.9em">
        {{ expense.transaction.description }}
      </span>
    </v-flex>
  </v-flex>
</template>

<script>
import { computed, inject } from 'vue';

import Date from './date';
import Money from './money';

export default {
  name: 'expense',
  components: {
    Date,
    Money,
  },

  props: {
    expense: Object,
    editing: Object,
  },

  setup(props) {
    const data = inject('data');
    const filter = inject('filter');

    const visible = computed(() => {
      return filter.match(props.expense);
    });

    return {
      filter,
      visible,

      del() {
        const index = data.expenses.indexOf(props.expense);
        data.expenses.splice(index, 1);
      },
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@mfro/vue-ui/src/style.scss";

.expense {
  cursor: pointer;
  position: relative;
  width: 80em;

  &:hover {
    background-color: #efefef;
  }

  &.active {
    background-color: lighten($primary, 40%);
  }

  &:hover.active {
    background-color: lighten($primary, 35%);
  }

  .date {
    flex: 0 0 6em;

    // .overlay {
    //   opacity: 0;
    //   transition: opacity 80ms;
    //   position: absolute;
    //   z-index: 1;
    // }

    // .date-actual {
    //   opacity: 1;
    //   transition: opacity 80ms;
    // }

    // &:hover > .overlay {
    //   opacity: 1;
    // }

    // &:hover > .date-actual {
    //   opacity: 0;
    // }
  }

  .money {
    flex: 0 0 6em;
  }

  .tags {
    flex: 0 0 20em;
  }

  .description {
    flex: 1 1 0;
  }
}
</style>

<template>
  <v-app>
    <v-flex grow class="pa-2" style="height: 100%; overflow: hidden">
      <v-flex column class="mr-2" style="height: 100%; overflow: hidden">
        <v-card>
          <tag-index :editing="editing" />
        </v-card>
      </v-flex>

      <v-flex column>
        <v-card grow style="overflow: hidden">
          <div style="height: 100%; overflow-y: scroll">
            <v-flex column>
              <!-- <keep-alive> -->
              <expense
                v-for="expense in sorted"
                :key="expense"
                :expense="expense"
                :editing="editing"
              />
              <!-- </keep-alive> -->
            </v-flex>
          </div>

          <v-flex class="pa-2" v-if="editing.size > 0" align-center>
            <span class="mr-3">{{ editing.size }} selected</span>
            <v-button small @click="editing.clear()">clear selection</v-button>
          </v-flex>
        </v-card>
      </v-flex>

      <v-flex grow class="ml-2">
        <canvas ref="canvas" />
      </v-flex>
    </v-flex>
    <!-- <input type="file" @input="onInput" /> -->
  </v-app>
</template>

<script>
import { computed, provide, shallowReactive, shallowRef, watch, watchEffect } from 'vue';

import TagIndex from './ui/tag-index';
import Date from './ui/date';
import Money from './ui/money';
import Expense from './ui/expense';

export default {
  name: 'app',
  components: {
    TagIndex,
    Date,
    Money,
    Expense,
  },

  props: {
    load: Function,
    money: Object,
  },

  setup(props) {
    const filter = {
      include: shallowReactive(new Set()),
      exclude: shallowReactive(new Set()),
      match: (e) => {
        return ([...filter.include].every(t => e.tags.has(t)))
          && ([...filter.exclude].every(t => !e.tags.has(t)));
      },
      result: computed(() => props.money.expenses.filter(e => filter.match(e))),
    };

    const cacheData = {
      byTag: computed(() => {
        const map = new Map();
        for (const expense of filter.result.value) {
          for (const tag of expense.tags) {
            const entry = map.get(tag);
            if (!entry) map.set(tag, entry = { total: { cents: 0 } });
            entry.total.cents += expense.transaction.value.cents;
          }
        }
        return map;
      }),
    };

    const cache = {
      byTag: (tag) => cacheData.byTag.value.get(tag) ?? { total: { cents: 0 } },
    };

    provide('money', props.money);
    provide('cache', cache);
    provide('filter', filter);

    const canvas = shallowRef(null);
    watch(canvas, canvas => {
      props.load(null, canvas, filter, cache);
    });

    const editing = shallowReactive(new Set);

    const sorted = computed(() => {
      return [...props.money.expenses].reverse()
        // .filter((e) => filter.match(e));
    });

    return {
      canvas,
      editing,
      filter,
      sorted,

      del(expense) {
        const index = props.money.expenses.indexOf(expense);
        props.money.expenses.splice(index, 1);

        const index2 = props.money.transactions.indexOf(expense.transaction);
        props.money.transactions.splice(index2, 1);
      },
    };
  },
};
</script>

<style lang="scss">
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.container {
  width: 145vh;
}
canvas {
}
</style>

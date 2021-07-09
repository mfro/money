<template>
  <v-app>
    <v-flex grow class="pa-2" style="height: 100%; overflow: hidden">
      <v-flex column class="mr-2" style="height: 100%; overflow: hidden">
        <v-card style="height: 100%; overflow: hidden">
          <tag-index :editing="editing" />
        </v-card>
      </v-flex>

      <v-flex column>
        <v-card grow style="overflow: hidden">
          <v-flex class="pa-2" align-center>
            <span>
              {{ filter.result.length }} Transactions,
              <money
                :value="{
                  cents: filter.result.reduce(
                    (sum, e) => sum + e.transaction.value.cents,
                    0
                  ),
                }"
              />
            </span>

            <span class="ml-3" />

            <filter-editor :filter="filter" />
          </v-flex>

          <div style="height: 100%; overflow-y: scroll">
            <v-flex column>
              <expense
                v-for="expense in sorted"
                :key="expense"
                :expense="expense"
                :editing="editing"
              />
            </v-flex>
          </div>

          <v-flex class="pa-2" v-if="editing.size > 0" align-center>
            <span>
              {{ editing.size }} selected,
              <money
                :value="{
                  cents: [...editing].reduce(
                    (sum, e) => sum + e.transaction.value.cents,
                    0
                  ),
                }"
              />
            </span>

            <span class="mr-3" />

            <v-button small @click="editing.clear()">clear selection</v-button>
          </v-flex>
        </v-card>
      </v-flex>

      <v-flex grow class="ml-2">
        <v-flex grow column>
          <v-flex>
            <v-button
              small
              :color="graphType == 'tag' ? 'primary' : 'default'"
              @click="graphType = 'tag'"
            >
              Tags
            </v-button>

            <v-button
              small
              class="ml-2"
              :color="graphType == 'date' ? 'primary' : 'default'"
              @click="graphType = 'date'"
            >
              Dates
            </v-button>
          </v-flex>

          <canvas style="flex: 1" ref="canvas" />
        </v-flex>
      </v-flex>
    </v-flex>
    <!-- <input type="file" @input="onInput" /> -->
  </v-app>
</template>

<script>
import { computed, provide, shallowReactive, shallowRef, watch, watchEffect } from 'vue';
import { Date } from 'common';

import TagIndex from './ui/tag-index';
import FilterEditor from './ui/filter-editor';
import date from './ui/date';
import money from './ui/money';
import expense from './ui/expense';

import { initGraph } from './graph';

export default {
  name: 'app',
  components: {
    TagIndex,
    FilterEditor,
    date,
    money,
    expense,
  },

  props: {
    money: Object,
    cache: Object,
    filter: Object,
  },

  setup(props) {
    provide('money', props.money);
    provide('cache', props.cache);
    provide('filter', props.filter);

    const editingDate = shallowRef(null);
    const dateInput = shallowRef(null);
    const dateInputField = shallowRef(null);

    watch(editingDate, (v, old) => {
      if (v == null) {
        try {
          const date = Date.load(dateInput.value);
          props.filter[old] = date;
        } catch { }
        dateInput.value = '';
      } else {
        setImmediate(() => {
          dateInputField.value.focus();
        });
      }
    });

    const canvas = shallowRef(null);
    const graphType = shallowRef('tag');
    initGraph(canvas, graphType, props.money, props.filter, props.cache);

    const editing = shallowReactive(new Set);

    const sorted = computed(() => {
      return [...props.money.expenses].reverse()
      // .filter((e) => filter.match(e));
    });

    return {
      canvas,
      editing,
      sorted,
      graphType,
      dateInput,
      dateInputField,
      editingDate,

      editDate(key) {
        if (props.filter[key] === null) {
          editingDate.value = key;
        } else {
          props.filter[key] = null;
        }
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
</style>

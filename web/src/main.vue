<template>
  <v-app>
    <v-flex grow class="pa-2" style="height: 100%; overflow: hidden">
      <v-flex column class="mr-2" style="height: 100%; overflow: hidden">
        <v-card style="max-height: 100%; overflow: hidden">
          <tag-index :editing="editing" />
        </v-card>

        <v-flex>
          <v-button
            :disabled="!canSave"
            color="primary"
            class="mt-2"
            @click="storage.save()"
          >
            save
          </v-button>
        </v-flex>
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
              :color="graph.type == 'tag' ? 'primary' : 'default'"
              @click="graph.type = 'tag'"
            >
              Tags
            </v-button>

            <v-button
              small
              class="ml-2"
              :color="graph.type == 'month' ? 'primary' : 'default'"
              @click="graph.type = 'month'"
            >
              Months
            </v-button>

            <v-button
              small
              class="ml-2"
              :color="graph.type == 'day' ? 'primary' : 'default'"
              @click="graph.type = 'day'"
            >
              Days
            </v-button>
          </v-flex>

          <canvas style="flex: 1" :ref="e => graph.canvas = e" />
        </v-flex>
      </v-flex>
    </v-flex>
    <!-- <input type="file" @input="onInput" /> -->
  </v-app>
</template>

<script>
import { computed, inject, shallowReactive } from 'vue';

import TagIndex from './ui/tag-index';
import FilterEditor from './ui/filter-editor';
import date from './ui/date';
import money from './ui/money';
import expense from './ui/expense';

import { StorageState } from './modules/storage';

export default {
  name: 'app',
  components: {
    TagIndex,
    FilterEditor,
    date,
    money,
    expense,
  },

  setup(props) {
    const data = inject('data');
    const storage = inject('storage');
    const filter = inject('filter');
    const cache = inject('cache');
    const graph = inject('graph');

    const canSave = computed(() => {
      return storage.state == StorageState.changed;
    });

    const editing = shallowReactive(new Set);

    const sorted = computed(() => {
      return [...data.expenses].reverse()
      // .filter((e) => filter.match(e));
    });

    return {
      data, cache, filter, storage, graph,
      canSave,
      editing,
      sorted,
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

<template>
  <v-dialog :modelValue="editing != null" @update:modelValue="editing = null">
    <v-card class="pb-4">
      <v-text-field
        v-model="input"
        ref="textField"
        label="mm/dd/yyyy"
        @keydown="$event.keyCode == 13 && (editing = null)"
      />
    </v-card>
  </v-dialog>

  <v-flex>
    <v-button x-small @click="editDate('before')">
      <span>
        Before
        <date v-if="filter.before" :value="filter.before" />
      </span>
    </v-button>

    <v-button x-small class="ml-3" @click="editDate('after')">
      <span>
        After
        <date v-if="filter.after" :value="filter.after" />
      </span>
    </v-button>
  </v-flex>
</template>

<script>
import { shallowRef, watch } from 'vue';
import { Date } from 'common';

import date from '../date';

export default {
  name: 'filter-editor',
  components: {
    date,
  },

  props: {
    filter: Object,
  },

  setup(props) {
    const editing = shallowRef(null);
    const input = shallowRef(null);
    const textField = shallowRef(null);

    watch(editing, (v, old) => {
      if (v == null) {
        try {
          const date = Date.load(input.value);
          props.filter[old] = date;
        } catch { }
        input.value = '';
      } else {
        setImmediate(() => {
          textField.value.focus();
        });
      }
    });

    return {
      input,
      textField,
      editing,

      editDate(key) {
        if (props.filter[key] === null) {
          editing.value = key;
        } else {
          props.filter[key] = null;
        }
      },
    };
  },
};
</script>

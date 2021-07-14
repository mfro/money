<template>
  <v-dialog
    :modelValue="editingDate != null"
    @update:modelValue="editingDate = null"
  >
    <v-card class="pb-4">
      <v-text-field
        v-model="dateInput"
        ref="dateTextField"
        label="mm/dd/yyyy"
        @keydown="$event.keyCode == 13 && (editingDate = null)"
      />
    </v-card>
  </v-dialog>

  <v-flex>
    <v-button
      x-small
      @click="editDate('before')"
      :color="filter.before ? 'primary' : 'default'"
    >
      <span>
        Before
        <date v-if="filter.before" :value="filter.before" />
      </span>
    </v-button>

    <v-button
      x-small
      class="ml-3"
      @click="editDate('after')"
      :color="filter.after ? 'primary' : 'default'"
    >
      <span>
        After
        <date v-if="filter.after" :value="filter.after" />
      </span>
    </v-button>

    <v-button
      x-small
      class="ml-3"
      @click="filter.exact = !filter.exact"
      :color="filter.exact ? 'primary' : 'default'"
    >
      <span>exact</span>
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
    const editingDate = shallowRef(null);
    const dateInput = shallowRef(null);
    const dateTextField = shallowRef(null);
    const exactCheckbox = shallowRef(null);

    watch(editingDate, (v, old) => {
      if (v == null) {
        try {
          const date = Date.load(dateInput.value);
          props.filter[old] = date;
        } catch { }
        dateInput.value = '';
      } else {
        setImmediate(() => {
          dateTextField.value.focus();
        });
      }
    });

    return {
      dateInput,
      dateTextField,
      editingDate,
      exactCheckbox,

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

<style lang="scss" scoped>
.exact-box {
  cursor: pointer;
  > * {
    cursor: pointer;
  }
}
</style>

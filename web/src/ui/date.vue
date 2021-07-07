<template>
  <span>{{ formatted }}</span>
</template>

<script>
import { computed } from 'vue';

import { Date } from 'common';

export default {
  name: 'date',

  props: {
    value: Object,
  },

  setup(props) {
    const formatted = computed(() => {
      return Date.save(props.value);
    });

    return {
      formatted,
    }
  },
};
</script>

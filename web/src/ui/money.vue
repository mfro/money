<template>
  <span>{{ formatted }}</span>
</template>

<script>
import { computed } from 'vue';

import { Money } from 'common';

export default {
  name: 'money',

  props: {
    value: Object,
  },

  setup(props) {
    const formatted = computed(() => {
      return Money.save(props.value)
        || '$0';
    });

    return {
      formatted,
    }
  },
};
</script>

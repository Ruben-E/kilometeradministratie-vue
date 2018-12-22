<template>
  <div>
    <label>{{label}} <a href='#' v-clap.prevent='setNow()'>set to today</a></label>
    <input v-el:date type='date' v-model='value' data-input>
  </div>
</template>
<script>
import Flatpickr from 'flatpickr';
import {getNow} from './lib/dateUtils.js';
import isDateInputSupported from './lib/isDateInputSupported.js';

export default {
  props: ['label', 'value'],

  ready() {
    const self = this;
    const pickerConfig = {
      allowInput: true,
      enableTime: false,
      dateFormat: 'd-m-Y',

      onChange() {
        self.changeFromFlatPickr = true;
      },
    };

    this.flatPickr = isDateInputSupported() ?
      zeropickr() :
      new Flatpickr(this.$els.date, pickerConfig);
  },

  detached() {
    this.flatPickr.destroy();
  },

  methods: {
    setNow() {
      this.value = getNow();
    },
  },

  watch: {
    value(newValue) {
      if (this.changeFromFlatPickr) {
        this.changeFromFlatPickr = false;
      } else {
        // This means, that underlying value was changed outside, so
        // we need to update our flatPickr instance value:
        this.flatPickr.setDate(newValue);
      }
    },
  },
};

/**
 * This is just a fake object that pretends to be a flatPickr, but does nothing.
 * We use this to avoid multiple if/else checks.
 */
function zeropickr() {
  return {
    setDate: noop,
    destroy: noop,
  };

  function noop() {}
}
</script>

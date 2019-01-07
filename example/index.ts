import Vue from 'vue';
import { store } from './store';

new Vue({
  store,
  el: document.getElementById('app'),
  render: h => h('div'),
});

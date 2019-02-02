import { Expect, SetupFixture, Test, TestFixture } from 'alsatian';

import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import { registerVuexTsModules, vuexTsBuilder, VuexTsModule, VuexTsModuleBuilder } from '../src';
import { id, staticMutations } from '../src/symbols';

import { doggoState } from '../example/doggos';
import { kittenState } from '../example/kittens';

@TestFixture('VuexTsModule Tests')
export class VuexTsModuleTestFixture {
  store: Store<any>;

  @SetupFixture
  setupFixture() {
    Vue.use(Vuex);

    this.store = new Store({
      plugins: [registerVuexTsModules(kittenState, doggoState)],
    });
  }

  @Test('Create a VuexTsModuleBuilder instance without error')
  public createVuexTsModuleBuilderTest() {
    const inst = vuexTsBuilder({ name: 'helloWorld' });
    Expect(inst).toBeDefined();
    Expect(inst instanceof VuexTsModuleBuilder).toBeTruthy();
  }

  @Test('Create a VuexTsModule instance without error')
  public createVuexTsModuleTest() {
    const inst = vuexTsBuilder({ name: 'helloWorld' }).inject();
    Expect(inst).toBeDefined();
    Expect(inst instanceof VuexTsModule).toBeTruthy();
  }

  @Test('Successfully clone a VuexTsModule instance')
  public cloneVuexTsModuleTest() {
    const clone = kittenState.clone('clone');
    clone.register(this.store);

    Expect(kittenState instanceof VuexTsModule).toBeTruthy();
    Expect(clone instanceof VuexTsModule).toBeTruthy();

    // State should be the same
    Expect(clone.state.kittens).toEqual(kittenState.state.kittens);

    // But ID should be different
    Expect((kittenState as any)[id] === (clone as any)[id]).not.toBeTruthy();

    clone.unregister();
  }

  // @Test('')
}

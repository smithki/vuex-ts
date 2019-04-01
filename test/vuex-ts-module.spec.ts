import { Expect, SetupFixture, Test, TestFixture } from 'alsatian';

import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import { CompositeVuexTsModule, registerVuexTsModules, vuexTsBuilder, VuexTsModule, VuexTsModuleBuilder } from '../src';
import { id } from '../src/symbols';

import { Doggo, DoggoBreed, doggoState } from '../example/doggos';
import { kittenState } from '../example/kittens';
import { moduleIsBound } from '../src/lib';

@TestFixture('VuexTsModule Tests')
export class VuexTsModuleTestFixture {
  store: Store<any>;
  dummyModule: CompositeVuexTsModule;

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

  @Test('Successfully register a module to the store')
  public registerModuleTest() {
    this.dummyModule = vuexTsBuilder({ name: 'helloWorld' }).inject();
    this.dummyModule.register(this.store);

    Expect(moduleIsBound(this.dummyModule as any)).toBeTruthy();
  }

  @Test('Prevent re-registering an already bound module')
  public preventReregisterTest() {
    try {
      this.dummyModule.register(this.store);
    } catch (err) {
      Expect(err).toBeDefined();
      return;
    }

    Expect(false).toBeTruthy();
  }

  @Test('Successfully unregister a module from the store')
  public unregisterModuleTest() {
    try {
      this.dummyModule.unregister();
    } catch (err) {
      Expect(err).not.toBeDefined();
    }

    Expect(moduleIsBound(this.dummyModule as any)).not.toBeTruthy();
  }

  @Test('Successfully commit a mutation using the object interface')
  public commitMutationObjectTest() {
    const newState: Doggo = { name: 'Rover', breed: DoggoBreed.Basset, age: 15 };

    doggoState.commit.addDoggo(newState);

    Expect(doggoState.state.doggos[1]).toEqual(newState);
  }

  @Test('Successfully commit a mutation using the function interface')
  public commitMutationFunctionTest() {
    const newState: Doggo = { name: 'Fido', breed: DoggoBreed.Golden, age: 8 };

    doggoState.commit('addDoggo', newState);

    Expect(doggoState.state.doggos[2]).toEqual(newState);
  }

  @Test(`Access a store's dynamic getters`)
  public accessGetterTest() {
    Expect(doggoState.getters.oldestDoggo).toBeDefined();
    Expect(doggoState.getters.oldestDoggo).toEqual({ name: 'Rover', breed: DoggoBreed.Basset, age: 15 });
  }
}

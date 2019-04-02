import { Expect, SetupFixture, Test, TestFixture } from 'alsatian';

import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import { registerVuexTsModules, VuexTsModule, vuexTsModuleBuilder, VuexTsModuleInstance } from '../src';
import { id } from '../src/symbols';

import { Doggo, DoggoBreed, DoggoModule, doggoState } from '../example/doggos';
import { kittenState } from '../example/kittens';
import { moduleIsBound } from '../src/lib';

@TestFixture('VuexTsModule Tests')
export class VuexTsModuleTestFixture {
  store: Store<any>;
  dummyModule: VuexTsModuleInstance<DoggoModule>;

  @SetupFixture
  setupFixture() {
    Vue.use(Vuex);

    this.store = new Store({
      plugins: [registerVuexTsModules(kittenState, doggoState)],
    });
  }

  @Test('Create a VuexTsModuleInstance object without error')
  public createVuexTsModuleBuilderTest() {
    const inst = vuexTsModuleBuilder(
      class extends VuexTsModule {
        name = 'test';
        state = () => {};
      },
    );
    Expect(inst).toBeDefined();
    Expect(inst instanceof VuexTsModuleInstance).toBeTruthy();
  }

  @Test('Successfully clone a VuexTsModuleInstance')
  public cloneVuexTsModuleTest() {
    const clone = kittenState.clone('clone');
    clone.register(this.store);

    Expect(kittenState instanceof VuexTsModuleInstance).toBeTruthy();
    Expect(clone instanceof VuexTsModuleInstance).toBeTruthy();

    // State should be the same
    Expect(clone.state.kittens).toEqual(kittenState.state.kittens);

    // But ID should be different
    Expect((kittenState as any)[id] === (clone as any)[id]).not.toBeTruthy();

    clone.unregister();
  }

  @Test('Successfully register a module to the store')
  public registerModuleTest() {
    this.dummyModule = vuexTsModuleBuilder(DoggoModule);
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
    this.dummyModule.register(this.store);
    const newState: Doggo = { name: 'Rover', breed: DoggoBreed.Basset, age: 15 };
    this.dummyModule.commit.addDoggo(newState);
    Expect(doggoState.state.doggos[1]).toEqual(newState);
  }

  @Test(`Access a store's dynamic getters`)
  public accessGetterTest() {
    Expect(this.dummyModule.getters.oldestDoggo).toBeDefined();
    Expect(this.dummyModule.getters.oldestDoggo).toEqual({ name: 'Rover', breed: DoggoBreed.Basset, age: 15 });
  }
}

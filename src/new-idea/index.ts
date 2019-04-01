import { ModuleActions, ModuleChildren, ModuleGetters, ModuleMutations } from './module-parts';
import { parent } from './symbols';
import { VuexTsModule } from './vuex-ts-module';

class MyGetters extends ModuleGetters {
  [parent] = () => MyModule;

  get test() {
    this.state.hello;
    this.state.childOne;
    this.rootState.asdf;
    return 'hello';
  }
}

class MyMutations extends ModuleMutations {
  [parent] = () => MyModule;

  test() {
    return this.state.hello;
  }
}

class MyActions extends ModuleActions {
  [parent] = () => MyModule;

  async test() {
    this.state;
  }
}

class MyChildren extends ModuleChildren {
  [parent] = () => MyModule;

  childOne = () => {};
}

class MyModule extends VuexTsModule<{ hello: string; qwerty: boolean }, { asdf: number }> {
  name: 'MyModule';

  state = () => {
    return {
      hello: '',
      qwerty: true,
    };
  };

  getters = () => MyGetters;
  mutations = () => MyMutations;
  actions = () => MyActions;
  children = () => MyChildren;
}

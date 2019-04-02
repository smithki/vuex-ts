# 💪 VuexTs

[![code style: airbnb](https://img.shields.io/badge/code%20style-airbnb-blue.svg?style=flat)](https://github.com/airbnb/javascript)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)

> Strongly-typed Vuex modules built for high-complexity stores and high-scalability needs.

## 🔗 Installation

Install via `yarn` (recommended):

```sh
yarn add vuex-ts
```

Install via `npm`:

```sh
npm install vuex-ts
```

## 🛠️ Usage

### Creating a basic module

VuexTs has a simple API consisting of two functions: `vuexTsModuleBuilder` and `registerVuexTsModules`. The rest is a pattern to ensure strong-typing, enforced by abstract TypeScript classes and supported by Symbol-based access to contextual `state`, `rootState`, and other features of Vuex from within your getter, mutation, and action handlers. If you're familiar with Redux, some of this pattern may be familiar to you.

Let's start with a basic example:

```ts
import { vuexTsModuleBuilder, VuexTsModule } from 'vuex-ts';
import { MyModuleState } from './myModule.model'; // MyModuleState is an interface describing the shape of this Vuex module.
import { RootState } from '../path/to/root-model'; // RootState is an interface describing the shape of your Vuex store.
import { MyModuleGetters } from './myModule.getters'; // MyModuleGetters is a class describing the getter handlers of this Vuex module.
import { MyModuleMutations } from './myModule.mutations'; // MyModuleMutations is a class describing the mutation handlers of this Vuex module.
import { MyModuleActions } from './myModule.actions'; // MyModuleActions is a class describing the action handlers of this Vuex module.
import { MyModuleChildren } from './myModule.children'; // MyModuleChildren is a class describing the nested modules of this Vuex module.

const initialMyModuleState: MyModuleState = {
  greeting: 'hello',
};

export class MyModule extends VuexTsModule<MyModuleState, RootState> {
  name = 'myModule';

  state = () => initialModuleState;

  getters = () => MyModuleGetters;
  mutations = () => MyModuleMutations;
  actions = () => MyModuleActions;
  modules = () => MyModuleChildren;
}

// vuexTsBuilder() wraps the module instantiation logic to enable
// type inference of injected getters, mutations, actions,
// and nested modules.
export const myModuleInstance = vuexTsModuleBuilder(MyModule);
```

Before we can use this module in our app we must register it to a Vuex store:

```ts
import Vue from 'vue';
import Vuex from 'vuex';
import { registerVuexTsModules } from 'vuex-ts';
import { myModuleInstance } from './path/to/myModule';

Vue.use(Vuex);

export const store = new Vuex.Store({
  plugins: [
    registerVuexTsModules(myModuleInstance);
  ]
});

// Alternatively, you can instantiate a Vuex store directly from the module.
// Doing it this way makes `myModuleInstance` into the root module of the store.
export const store = myModuleInstance.toStore({
  // You can add plugins or set "strict" mode here.
});
```

Now let's write our `getters`:

```ts
import { ModuleGetters, get, usedIn } from 'vuex-ts';
import { MyModule } from './path/to/myModule';

export class MyModuleGetters extends ModuleGetters<MyModuleState, RootState> {
  // We set this hint to enable strong typing throughout the module, including
  // references to registered mutations, actions, getters, and child modules.
  [usedIn] = () => MyModule;

  // If your handler returns a property directly, define it as a computed getter.
  get helloWorld() {
    // `get.state` is a Symbol representing the contextual state for this module
    // at the time this handler is executed.
    return `${this[get.state].greeting} world!`;
  }

  // If your handler returns a function, define it as a method. Its type
  // signature will carry over to your module and enforce typing accordingly.
  helloPerson(name: string) {
    return `${this[get.state].greeting}, ${name}!`;
  }
}
```

And our `mutations`:

```ts
import { ModuleMutations, state } from 'vuex-ts';
import { MyModule } from './path/to/myModule';

export class MyModuleMutations extends ModuleMutations {
  [usedIn] = () => MyModule;

  // Define your mutation handlers as methods that accept one argument
  // (the "payload"). Its type signature will carry over to your module and
  // enforce typing accordingly.
  setGreeting(newGreeting: string) {
    this[state].greeting = newGreeting;
  }
}
```

And our `actions`:

```ts
import { ModuleActions, state } from 'vuex-ts';
import { MyModule } from './path/to/myModule';

export class MyModuleActions extends ModuleActions {
  [usedIn] = () => MyModule;

  // Define your action handlers as asynchronous methods that accept one
  // argument (the "payload"). Its type signature will carry over to your
  // module and enforce typing accordingly.
  //
  // Action handlers can optionally return a value!
  async fetchGreeting(newGreeting: string) {
    const response = await fetch(YOUR_API);
    const json = await response.json();
    this[state].greeting = json.data; // Use your imagination!
  }
}
```

And finally, of course, we can define some nested modules:

```ts
import { ModuleChildren } from 'vuex-ts';
import { SomeNestedModule } from '../path/to/someNestedModule';
import { MyModule } from './path/to/myModule';

export class MyModuleChildren extends ModuleChildren {
  [usedIn] = () => MyModule;

  // Must be a function or method that returns an constructor of VuexTsModule
  someNestedModule = () => someNestedModule;
}
```

Nested modules are accessible from the top-level of their parent, like this:

```ts
// It's just another VuexTsModule object,
// so you have access to `state`, `commit`, `dispatch`, etc.
myModule.someNestedModule
```

That's all there is to it! Naturally, you can choose to separate actions/mutations/getters across files or consolidate. A separation of concerns alongside strong typing is what makes VuexTs work well at scale!

For a working example, see [`./example`](./example).

## API

Detailed API documentation forthcoming...

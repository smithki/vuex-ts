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

VuexTs has a simple API consisting of two functions: `vuexTsBuilder` and `registerVuexTsModules`. The rest is a just a pattern to ensure strong-typing, enforced by abstract TypeScript classes and supported by Symbol-based access to contextual `state`, `rootState`, and other features of Vuex from within your getter, mutation, and action handlers. If you're familiar with Redux, some of this pattern will be familiar, too.

Let's start with a basic example:

```ts
import { vuexTsBuilder } from 'vuex-ts';
import { MyModuleState } from './myModule.model'; // MyModuleState is an interface describing the shape of this Vuex module.
import { RootState } from '../path/to/root-model'; // RootState is an interface describing the shape of your Vuex store.
import { MyModuleGetters } from './myModule.getters'; // MyModuleGetters is a class describing the getter handlers of this Vuex module.
import { MyModuleMutations } from './myModule.mutations'; // MyModuleMutations is a class describing the mutation handlers of this Vuex module.
import { MyModuleActions } from './myModule.actions'; // MyModuleActions is a class describing the action handlers of this Vuex module.
import { MyModuleChildren } from './myModule.children'; // MyModuleChildren is a class describing the nested modules of this Vuex module.

const initialMyModuleState: MyModuleState = {
  greeting: 'hello',
};

export const myModule = VuexTsBuilder<
  MyModuleState,
  RootState,
>({
  name: 'myModule', // Required.
  state: initialMyModuleState,
}).inject({
  getters: MyModuleGetters,
  mutations: MyModuleMutations,
  actions: MyModuleActions,
  modules: MyModuleChildren,
});
```

Before we can use this module we must register it to our Vuex store:

```ts
import Vue from 'vue';
import Vuex from 'vuex';
import { registerVuexTsModules } from 'vuex-ts';
import { myModule } from './path/to/myModule';

Vue.use(Vuex);

export const store = new Vuex.Store({
  plugins: [
    registerVuexTsModules(myModule);
  ]
});
```

Now let's write our `getters`:

```ts
import { ModuleGetters, state } from 'vuex-ts';
import { MyModuleState } from './myModule.model';
import { RootState } from '../path/to/root-model';

export class MyModuleGetters extends ModuleGetters<MyModuleState, RootState> {
  // If your handler returns a property directly, define it as a computed getter.
  get helloWorld() {
    // `state` is a Symbol representing the contextual state for this module
    // at the time this handler is executed.
    return `${this[state].greeting} world!`;
  }

  // If your handler returns a function, define it as a method. Its type
  // signature will carry over to your module and enforce typing accordingly.
  helloPerson(name: string) {
    return `${this[state].greeting}, ${name}!`;
  }
}
```

And our `mutations`:

```ts
import { ModuleMutations, state } from 'vuex-ts';
import { MyModuleState } from './myModule.model';

export class MyModuleMutations extends ModuleMutations<MyModuleState> {
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
import { MyModuleState } from './myModule.model';
import { RootState } from '../path/to/root-model';

export class MyModuleActions extends ModuleActions<MyModuleState, RootState> {
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
import { someNestedModule } from '../path/to/someNestedModule';

export class MyModuleChildren extends ModuleChildren {
  someNestedModule = someNestedModule; // Must be an instance of VuexTsModule
}
```

Nested modules are accessible from the top-level of their parent, like this:

```ts
// It's just another instance of VuexTsModule,
// so you have access to `store`, `commit`, `dispatch`, etc.
myModule.someNestedModule

// You can also access nested state objects just as you would expect,
// with its type signature properly inferred!
myModule.state.someNestedModule
```

That's all there is to it! Naturally, you can choose to separate actions/mutations/getters across files or consolidate. A separation of concerns alongside strong typing is what makes VuexTs work well at scale!

For a working example, see [`./example`](./example);

## API

Detailed API documentation forthcoming...

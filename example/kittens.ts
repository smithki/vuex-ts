import { ChildState, CompositeVuexTsModule, ConstructorOf, InferChildren, InferModuleState, ModuleChildren, ModuleGetters, ModuleMutations, state, VuexTsFactories } from '../src';
import { doggoState } from './doggos';
import { RootState } from './root-state';

export enum KittenBreed {
  Dsh = 'DOMESTIC_SHORT_HAIR',
  Dmh = 'DOMESTIC_MEDIUM_HAIR',
  Dlh = 'DOMESTIC_LONG_HAIR',
}

export interface Kitten {
  name: string;
  breed: KittenBreed;
  age: number;
}

export interface KittenState {
  kittens: Kitten[];
}

type Abc<T> = T extends CompositeVuexTsModule<infer A, infer B, any, infer D, infer E, infer F> ?  CompositeVuexTsModule<A, B, never, D, E, F> : never;

// --- Getters --- //
function inject<T extends () => CompositeVuexTsModule>(a: T, b: typeof ModuleGetters): ConstructorOf<ModuleGetters<InferModuleState<Abc<ReturnType<T>>>, ChildState<InferChildren<Abc<ReturnType<T>>>>>> {
  return ModuleGetters as any;
}

const xyz: Abc<typeof kittenState>;

export class KittenGetters extends ModuleGetters<typeof kittenState> {
  get oldestKitten() {
    this.state.;
    return this[state].kittens.reduce((a, b) => (a.age > b.age ? a : b));
  }

  get youngestKitten() {
    return this[state].kittens.reduce((a, b) => (a.age < b.age ? a : b));
  }
}

// --- Mutations --- //

export class KittenMutations extends ModuleMutations<KittenState> {
  addKitten(payload: Kitten) {
    this[state].kittens.push(payload);
  }
}

// --- Nested modules --- //

export class KittenChildren extends ModuleChildren {
  doggoNested = () => doggoState;
}

// --- Module --- //

export const kittenState = VuexTsFactories.moduleBuilder<KittenState, RootState>({
  name: 'kittenState',
  state: () => ({
    kittens: [
      {
        name: 'Mittens',
        breed: KittenBreed.Dmh,
        age: 4,
      },
    ],
  }),
}).inject({
  getters: KittenGetters,
  mutations: KittenMutations,
  modules: KittenChildren,
});

class B<T> {
  testt: T;
}

class C extends B<M> {
  constructor() {
    super();
    this.testt
  }
}

class M {
  b = C;
}

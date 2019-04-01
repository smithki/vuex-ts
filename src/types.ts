import { ActionContext, Module, StoreOptions } from 'vuex';
import { ModuleActions, ModuleChildren, ModuleGetters, ModuleMutations } from './module-parts';
import { VuexTsModule } from './typed-module';

// --- Utilities ------------------------------------------------------------ //

export type ConstructorOf<C> = { new (...args: any[]): C };
export type KnownKeys<T> = { [K in keyof T]: string extends K ? never : number extends K ? never : K } extends {
  [_ in keyof T]: infer U
}
  ? U extends keyof T
    ? U
    : never
  : never;
export type MappedKnownKeys<T> = Pick<T, Exclude<KnownKeys<T>, symbol>>;
export type ReturnTypeOrPlainProperty<T> = T extends (...args: any[]) => any ? ReturnType<T> : T;
export interface BareStoreOptions<RootState> extends Pick<StoreOptions<RootState>, 'plugins' | 'strict'> {}

/**
 * Extend from this interface to extract the state type signature from a CompositeVuexTsModule.
 */
export type StateInterfaceFromModule<T extends CompositeVuexTsModule> = T extends CompositeVuexTsModule
  ? {
      [P in Exclude<KnownKeys<T['state']>, Exclude<KnownKeys<VuexTsModule>, symbol>>]: Exclude<
        KnownKeys<T['state']>,
        Exclude<KnownKeys<VuexTsModule>, symbol>
      >[P]
    }
  : never;

// tslint:disable:prettier
export type InferModuleState<T extends CompositeVuexTsModule> = T extends CompositeVuexTsModule<infer P, any, any, any, any, any> ? P : never;
export type InferRootState<T extends CompositeVuexTsModule>   = T extends CompositeVuexTsModule<any, infer P, any, any, any, any> ? P : never;
export type InferGetters<T extends CompositeVuexTsModule>     = T extends CompositeVuexTsModule<any, any, infer P, any, any, any> ? P : never;
export type InferMutations<T extends CompositeVuexTsModule>   = T extends CompositeVuexTsModule<any, any, any, infer P, any, any> ? P : never;
export type InferActions<T extends CompositeVuexTsModule>     = T extends CompositeVuexTsModule<any, any, any, any, infer P, any> ? P : never;
export type InferChildren<T extends CompositeVuexTsModule>    = T extends CompositeVuexTsModule<any, any, any, any, any, infer P> ? P : never;
// tslint:enable:prettier

// --- Getters -------------------------------------------------------------- //

export type StaticGetters = { [key: string]: (vuexState: any, vuexGetters: any, vuexRootState: any) => any };

// --- Mutations ------------------------------------------------------------ //

export type StaticMutations = { [key: string]: (vuexState: any, payload: any) => void };
export type CommitFunc<T extends ModuleMutations<any>> = (
  mutationName: Exclude<KnownKeys<T>, symbol>,
  ...payload: Parameters<T[typeof mutationName]>
) => void;

// --- Actions -------------------------------------------------------------- //

export type StaticActions = { [key: string]: (vuexContext: ActionContext<any, any>, payload: any) => Promise<any> };
export type DispatchFunc<T extends ModuleActions<any, any>> = (
  actionName: Exclude<KnownKeys<T>, symbol>,
  ...payload: Parameters<T[typeof actionName]>
) => ReturnType<T[typeof actionName]>;

// --- Nested modules ------------------------------------------------------- //

export type StaticChildren = { [key: string]: Module<any, any> };

export type ChildState<T extends ModuleChildren> = {
  [P in Exclude<KnownKeys<T>, KnownKeys<VuexTsModule>>]: ReturnType<T[P]>['state']
};

export type MappedModuleChildren<T extends ModuleChildren> = {
  [P in Exclude<KnownKeys<T>, KnownKeys<VuexTsModule>>]: Pick<
    ReturnType<T[P]>,
    Exclude<KnownKeys<VuexTsModule>, 'unregister' | 'register' | 'toStore' | symbol>
  >
};

export type CompositeVuexTsModule<
  ModuleState = any,
  RootState = any,
  Getters extends ModuleGetters<ModuleState, RootState> = any,
  Mutations extends ModuleMutations<ModuleState> = any,
  Actions extends ModuleActions<ModuleState, RootState> = any,
  Modules extends ModuleChildren = any
> = Pick<
  VuexTsModule<ModuleState, RootState, Getters, Mutations, Actions, Modules> & MappedModuleChildren<Modules>,
  | KnownKeys<MappedModuleChildren<Modules>>
  | Exclude<KnownKeys<VuexTsModule<ModuleState, RootState, Getters, Mutations, Actions, Modules>>, symbol>
>;

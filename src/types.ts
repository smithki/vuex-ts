import { ActionContext, Module, StoreOptions } from 'vuex';
import { ModuleActions, ModuleChildren, ModuleGetters, ModuleMutations, VuexTsModule } from './typed-module';

// --- Helpers and misc ----------------------------------------------------- //

export type ArgumentTypes<F extends (...args: any[]) => any> = F extends (...args: infer A) => any ? A : never;
export type ConstructorOf<C> = { new (...args: any[]): C };
export type KnownKeys<T> = { [K in keyof T]: string extends K ? never : number extends K ? never : K } extends {
  [_ in keyof T]: infer U
}
  ? U
  : never;
export type MappedKnownKeys<T> = Pick<T, Exclude<KnownKeys<T>, symbol>>;
export type ReturnTypeOrPlainProperty<T> = T extends (...args: any[]) => any ? ReturnType<T> : T;
export interface BareStoreOptions<RootState> extends Pick<StoreOptions<RootState>, 'plugins' | 'strict'> {}

// --- Getters -------------------------------------------------------------- //

export type StaticGetters = { [key: string]: (vuexState: any, vuexRootState: any) => any };

// --- Mutations ------------------------------------------------------------ //

export type StaticMutations = { [key: string]: (vuexState: any, payload: any) => void };
export type CommitFunc<T extends ModuleMutations<any>> = (
  mutationName: Exclude<KnownKeys<T>, symbol>,
  ...payload: ArgumentTypes<T[typeof mutationName]>
) => void;

// --- Actions -------------------------------------------------------------- //

export type StaticActions = { [key: string]: (vuexContext: ActionContext<any, any>, payload: any) => Promise<any> };
export type DispatchFunc<T extends ModuleActions<any, any>> = (
  actionName: Exclude<KnownKeys<T>, symbol>,
  ...payload: ArgumentTypes<T[typeof actionName]>
) => ReturnType<T[typeof actionName]>;

// --- Nested modules ------------------------------------------------------- //

export type StaticChildren = { [key: string]: Module<any, any> };
export type ChildState<T extends ModuleChildren> = { [P in keyof T]: ReturnType<T[P]>['state'] };
export type MappedModuleChildren<T extends ModuleChildren> = {
  [P in Exclude<KnownKeys<T>, Exclude<KnownKeys<VuexTsModule<any, any, any, any, any, any>>, symbol>>]: ReturnType<
    Pick<T, Exclude<KnownKeys<T>, Exclude<KnownKeys<VuexTsModule<any, any, any, any, any, any>>, symbol>>>[P]
  >
};
export type CompositeVuexTsModule<
  ModuleState,
  RootState,
  Getters extends ModuleGetters<ModuleState, RootState>,
  Mutations extends ModuleMutations<ModuleState>,
  Actions extends ModuleActions<ModuleState, RootState>,
  Modules extends ModuleChildren
> = Pick<
  VuexTsModule<ModuleState, RootState, Getters, Mutations, Actions, Modules> & MappedModuleChildren<Modules>,
  | KnownKeys<MappedModuleChildren<Modules>>
  | Exclude<KnownKeys<VuexTsModule<ModuleState, RootState, Getters, Mutations, Actions, Modules>>, symbol>
>;

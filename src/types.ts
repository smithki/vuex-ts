import { ActionContext, Module } from 'vuex';
import { ModuleActions, ModuleChildren, ModuleMutations, VuexTsModule } from './typed-module';

// --- Helpers -------------------------------------------------------------- //

export type ArgumentTypes<F extends (...args: any[]) => any> = F extends (...args: infer A) => any ? A : never;
export type ConstructorOf<C> = { new (...args: any[]): C };
export type KnownKeys<T> = { [K in keyof T]: string extends K ? never : number extends K ? never : K } extends {
  [_ in keyof T]: infer U
}
  ? U
  : never;
export type MappedKnownKeys<T> = Pick<T, Exclude<KnownKeys<T>, symbol>>;
export type ReturnTypeOrPlainProperty<T> = T extends (...args: any[]) => any ? ReturnType<T> : T;

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
export type ChildState<T extends ModuleChildren> = { [P in keyof T]: T[P]['state'] };

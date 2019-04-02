// --- Imports -------------------------------------------------------------- //

// Vendor
import { ActionContext, Module, StoreOptions } from 'vuex';

// Internal
import { ModuleActions, ModuleChildren, ModuleMutations, ModulePart } from './module-parts';
import { typeMetadata, usedIn } from './symbols';
import { VuexTsModule, VuexTsModuleInstance, VuexTsModuleInstanceProxy } from './vuex-ts-module';

// --- General type utilities ----------------------------------------------- //

export type ConstructorOf<C> = { new (...args: any[]): C };

export type PrototypeOf<C extends any> = C['prototype'];

export type KnownKeys<T> = { [K in keyof T]: string extends K ? never : number extends K ? never : K } extends {
  [_ in keyof T]: infer U
}
  ? U extends keyof T
    ? U
    : never
  : never;

export type MappedKnownKeys<T> = Pick<T, Exclude<KnownKeys<T>, symbol>>;

export interface BareStoreOptions<RootState> extends Pick<StoreOptions<RootState>, 'plugins' | 'strict'> {}

export type StateInterfaceFromModule<T extends VuexTsModuleInstance<any>> = T extends VuexTsModuleInstance<infer P>
  ? GetState<P> & GetChildState<P>
  : never;

// --- Module type utilities ------------------------------------------------ //

export type reservedKeys = symbol;

export type ModulePartFactory<T extends ModulePart = ModulePart> = (() => ConstructorOf<T>) | undefined;

export type UnwrapModulePartFactory<T extends ModulePartFactory> = InstanceType<ReturnType<NonNullable<T>>>;

export type MappedModulePart<T extends ModulePartFactory> = T extends ModuleActions | ModuleMutations
  ? Pick<
      PrototypeOf<UnwrapModulePartFactory<T>>,
      Exclude<KnownKeys<PrototypeOf<UnwrapModulePartFactory<T>>>, reservedKeys>
    >
  : Pick<UnwrapModulePartFactory<T>, Exclude<KnownKeys<UnwrapModulePartFactory<T>>, reservedKeys>>;

export type ChildState<T extends ModuleChildren> = {
  [P in keyof T]: InstanceType<ReturnType<T[P]>>[typeof typeMetadata][MetadataModuleState] &
    ChildState<InstanceType<ReturnType<T[P]>>[typeof typeMetadata][MetadataChildren]>
};

// tslint:disable:prettier
export type MetadataSelf        = 0;
export type MetadataModuleState = 1;
export type MetadataRootState   = 2;
export type MetadataGetters     = 3;
export type MetadataMutations   = 4;
export type MetadataActions     = 5;
export type MetadataChildren    = 6;
// tslint:enable:prettier

// --- ModulePart type utilities -------------------------------------------- //

export type GetParent<T extends ModulePart> = InstanceType<ReturnType<T[typeof usedIn]>>;
export type GetParentTypeMetadata<T extends ModulePart> = GetParent<T>[typeof typeMetadata];

export type InferVuexTsModuleBuilderFromParent<T extends ModulePart> = {
  [P in keyof InferChildren<T>]: VuexTsModuleInstance<InstanceType<ReturnType<InferChildren<T>[P]>>>
};

// tslint:disable:prettier
export type InferVuexTsModule<T extends ModulePart> = GetParentTypeMetadata<T>[MetadataSelf];
export type InferCommitters<T extends ModulePart>   = GetMutations<InferVuexTsModule<T>>;
export type InferDispatchers<T extends ModulePart>  = GetActions<InferVuexTsModule<T>>;
export type InferModuleState<T extends ModulePart>  = GetParentTypeMetadata<T>[MetadataModuleState];
export type InferRootState<T extends ModulePart>    = GetParentTypeMetadata<T>[MetadataRootState];
export type InferGetters<T extends ModulePart>      = GetParentTypeMetadata<T>[MetadataGetters];
export type InferMutations<T extends ModulePart>    = GetParentTypeMetadata<T>[MetadataMutations];
export type InferActions<T extends ModulePart>      = GetParentTypeMetadata<T>[MetadataActions];
export type InferChildren<T extends ModulePart>     = GetParentTypeMetadata<T>[MetadataChildren];
export type InferChildState<T extends ModulePart>   = ChildState<InferChildren<T>>;
// tslint:enable:prettier
export type InferChildModuleProxies<T extends ModulePart> = {
  [P in keyof InferChildren<T>]: VuexTsModuleInstanceProxy<InstanceType<ReturnType<InferChildren<T>[P]>>> &
    InferChildModuleProxies<
      InferChildren<InstanceType<ReturnType<InferChildren<T>[P]>>[typeof typeMetadata][MetadataChildren]>
    >
};

// --- VuexTsModule type utilities ------------------------------------------ //

// tslint:disable:prettier
export type GetState<T extends VuexTsModule>      = ReturnType<T['state']>;
export type GetGetters<T extends VuexTsModule>    = MappedModulePart<T['getters']>;
export type GetMutations<T extends VuexTsModule>  = MappedModulePart<T['mutations']>;
export type GetActions<T extends VuexTsModule>    = MappedModulePart<T['actions']>;
export type GetChildren<T extends VuexTsModule>   = MappedModulePart<T['modules']>;
export type GetChildState<T extends VuexTsModule> = ChildState<UnwrapModulePartFactory<T['modules']>>;
// tslint:enable:prettier

export type GetChildModuleProxies<T extends VuexTsModule> = {
  [P in keyof UnwrapModulePartFactory<T['modules']>]: VuexTsModuleInstanceProxy<
    InstanceType<ReturnType<UnwrapModulePartFactory<T['modules']>[P]>>
  > &
    GetChildModuleProxies<InstanceType<ReturnType<UnwrapModulePartFactory<T['modules']>[P]>>>
};

// --- Static Vuex definitions ---------------------------------------------- //

export type StaticGetters = { [key: string]: (vuexState: any, vuexGetters: any, vuexRootState: any) => any };
export type StaticMutations = { [key: string]: (vuexState: any, payload: any) => void };
export type StaticActions = { [key: string]: (vuexContext: ActionContext<any, any>, payload: any) => Promise<any> };
export type StaticChildren = { [key: string]: Module<any, any> };

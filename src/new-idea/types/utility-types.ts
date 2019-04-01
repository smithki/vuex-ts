// --- Imports -------------------------------------------------------------- //

import { ModuleChildren, ModulePart } from '../module-parts';
import { parent, typeMetadata } from '../symbols';

// -------------------------------------------------------------------------- //

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

// -------------------------------------------------------------------------- //

export type UnwrapModulePartFactory<T extends (() => ConstructorOf<ModulePart>) | undefined> = InstanceType<
  ReturnType<NonNullable<T>>
>;

// tslint:disable:prettier
export type MetadataModuleState = 0;
export type MetadataRootState   = 1;
export type MetadataGetters     = 2;
export type MetadataMutations   = 3;
export type MetadataActions     = 4;
export type MetadataChildren    = 5;
// tslint:enable:prettier

export type GetParent<T extends ModulePart> = InstanceType<ReturnType<T[typeof parent]>>;
export type GetParentTypeMetadata<T extends ModulePart> = GetParent<T>[typeof typeMetadata];

export type ChildState<T extends ModuleChildren> = {
  [P in Exclude<KnownKeys<T>, symbol>]: InstanceType<ReturnType<T[P]>>[typeof typeMetadata][MetadataModuleState]
};

// tslint:disable:prettier
export type InferModuleStateFromParent<T extends ModulePart> = GetParentTypeMetadata<T>[MetadataModuleState];
export type InferRootStateFromParent<T extends ModulePart>   = GetParentTypeMetadata<T>[MetadataRootState];
export type InferGettersFromParent<T extends ModulePart>     = GetParentTypeMetadata<T>[MetadataGetters];
export type InferMutationsFromParent<T extends ModulePart>   = GetParentTypeMetadata<T>[MetadataMutations];
export type InferActionsFromParent<T extends ModulePart>     = GetParentTypeMetadata<T>[MetadataActions];
export type InferChildrenFromParent<T extends ModulePart>    = GetParentTypeMetadata<T>[MetadataChildren];
export type InferChildStateFromParent<T extends ModulePart>  = ChildState<InferChildrenFromParent<T>>;
// tslint:enable:prettier

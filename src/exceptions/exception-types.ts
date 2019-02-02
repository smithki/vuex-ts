export enum VuexTsErrorCode {
  NoActionsDefinedError = 'NO_ACTIONS_DEFINED_ERROR',
  NoMutationsDefinedError = 'NO_MUTATIONS_DEFINED_ERROR',
  ModuleNotBoundToStoreError = 'MODULE_NOT_BOUND_TO_STORE_ERROR',
  ModuleBoundToSameStoreError = 'MODULE_BOUND_TO_SAME_STORE_ERROR',
  ModuleBoundToDifferentStoreError = 'MODULE_BOUND_TO_DIFFERENT_STORE_ERROR',
  RootModuleUnregisterError = 'ROOT_MODULE_UNREGISTER_ERROR',
  NestedModuleUnregisterError = 'NESTED_MODULE_UNREGISTER_ERROR',
  InvalidStoreError = 'INVALID_STORE_ERROR',
  UndefinedStoreError = 'UNDEFINED_STORE_ERROR',
}

export interface VuexTsError {
  code: VuexTsErrorCode;
}

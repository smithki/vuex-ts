// --- Imports -------------------------------------------------------------- //

import { VuexTsError, VuexTsErrorCode } from './exception-types';

// --- Error classes -------------------------------------------------------- //

export class NoActionsDefinedError extends ReferenceError implements VuexTsError {
  code = VuexTsErrorCode.NoActionsDefinedError;
  name = 'NoActionsDefinedError';

  constructor(moduleName: string) {
    super(`No actions defined on module '${moduleName}'.`);
  }
}

// --- //

export class NoMutationsDefinedError extends ReferenceError implements VuexTsError {
  code = VuexTsErrorCode.NoMutationsDefinedError;
  name = 'NoMutationsDefinedError';

  constructor(moduleName: string) {
    super(`No mutations defined on module '${moduleName}'.`);
  }
}

// --- //

export class ModuleNotBoundToStoreError extends Error implements VuexTsError {
  code = VuexTsErrorCode.ModuleNotBoundToStoreError;
  name = 'ModuleNotBoundToStoreError';

  constructor(moduleName: string, propOrMethodName: string) {
    super(
      `Module '${moduleName}' is not registered to a Vuex store. Call '${moduleName}.register(store)' before accessing '${moduleName}.${propOrMethodName}'.`,
    );
  }
}

// --- //

export class ModuleBoundToSameStoreError extends Error implements VuexTsError {
  code = VuexTsErrorCode.ModuleBoundToSameStoreError;
  name = 'ModuleBoundToSameStoreError';

  constructor(moduleName: string, moduleNamespaceKey: string) {
    super(
      `Module '${moduleNamespaceKey}' is already registered to the provided store. There is no need to call '${moduleName}.register()' again.`,
    );
  }
}

// --- //

export class ModuleBoundToDifferentStoreError extends Error implements VuexTsError {
  code = VuexTsErrorCode.ModuleBoundToDifferentStoreError;
  name = 'ModuleBoundToDifferentStoreError';

  constructor(moduleName: string, moduleNamespaceKey: string) {
    super(
      `Module '${moduleNamespaceKey}' is registered to another Vuex store. VuexTs modules can only be registered to one Vuex store at a time. You can unregister this module by calling '${moduleName}.unregister()' or create a new module instance with '${moduleName}.clone()'.`,
    );
  }
}

// --- //

export class RootModuleUnregisterError extends Error implements VuexTsError {
  code = VuexTsErrorCode.RootModuleUnregisterError;
  name = 'RootModuleUnregisterError';

  constructor(moduleName: string) {
    super(`Module '${moduleName}' cannot be unregistered because it is the root module.`);
  }
}

// --- //

export class NestedModuleUnregisterError extends Error implements VuexTsError {
  code = VuexTsErrorCode.NestedModuleUnregisterError;
  name = 'NestedModuleUnregisterError';

  constructor(moduleName: string, parentModuleName: string, parentIsRoot: boolean) {
    super(
      `Module '${moduleName}' cannot be unregistered because it is a nested module. Try unregistering its parent module '${parentModuleName}'`,
    );

    if (parentIsRoot) {
      this.message = `Module '${moduleName}' cannot be unregistered because it is nested under the root and therefore not dynamic.`;
    } else {
      this.message = `Module '${moduleName}' cannot be unregistered because it is a nested module. You can unregister its parent module ('${parentModuleName}') by calling '${parentModuleName}.unregister()'.`;
    }
  }
}

// --- //

export class InvalidStoreError extends TypeError implements VuexTsError {
  code = VuexTsErrorCode.InvalidStoreError;
  name = 'InvalidStoreError';

  constructor(moduleName: string) {
    super(`Store instance provided to '${moduleName}.register(store)' is not a valid Vuex.Store instance.`);
  }
}

// --- //

export class UndefinedStoreError extends TypeError implements VuexTsError {
  code = VuexTsErrorCode.UndefinedStoreError;
  name = 'UndefinedStoreError';

  constructor(moduleName: string) {
    super(`Store instance provided to '${moduleName}.register(store)' is undefined.`);
  }
}

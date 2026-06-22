/**
 * @description UI decorators module for TypeScript applications
 * @summary A collection of decorators and utilities for building UI components in TypeScript applications.
 * This module exports functionality from both the model and UI submodules, providing decorators for
 * rendering, component definition, and UI state management.
 * @module ui-decorators
 */

import "./overrides";
import { Metadata } from "@decaf-ts/decoration";
export * from "./overrides";
export * from "./model";
export * from "./ui";

/**
 * @description Current package version string
 * @summary Stores the current package version for reference
 * @const VERSION
 * @memberOf module:ui-decorators
 */
export const VERSION = "##VERSION##";

/**
 * @description Represents the current commit hash of the module build.
 * @summary Stores the current git commit hash for the package. The build replaces
 * the placeholder with the actual commit hash at publish time.
 * @const COMMIT
 */
export const COMMIT = "##COMMIT##";

/**
 * @description Represents the full version string of the module.
 * @summary Stores the semver version and commit hash for the package.
 * The build replaces the placeholder with the actual `<version>-<commit>` value at publish time.
 * @const FULL_VERSION
 */
export const FULL_VERSION = "##FULL_VERSION##";

export const PACKAGE_NAME = "##PACKAGE##";

Metadata.registerLibrary(PACKAGE_NAME, VERSION);

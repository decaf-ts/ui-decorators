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

export const PACKAGE_NAME = "##PACKAGE##";

Metadata.registerLibrary(PACKAGE_NAME, VERSION);

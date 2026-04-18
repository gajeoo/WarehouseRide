/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ViktorSpacesEmail from "../ViktorSpacesEmail.js";
import type * as activation from "../activation.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as constants from "../constants.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as customers from "../customers.js";
import type * as http from "../http.js";
import type * as invoices from "../invoices.js";
import type * as notifications from "../notifications.js";
import type * as quotes from "../quotes.js";
import type * as reminders from "../reminders.js";
import type * as routes from "../routes.js";
import type * as seed from "../seed.js";
import type * as seedTestUser from "../seedTestUser.js";
import type * as settings from "../settings.js";
import type * as testAuth from "../testAuth.js";
import type * as users from "../users.js";
import type * as vehicles from "../vehicles.js";
import type * as viktorTools from "../viktorTools.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ViktorSpacesEmail: typeof ViktorSpacesEmail;
  activation: typeof activation;
  auth: typeof auth;
  chat: typeof chat;
  constants: typeof constants;
  contact: typeof contact;
  crons: typeof crons;
  customers: typeof customers;
  http: typeof http;
  invoices: typeof invoices;
  notifications: typeof notifications;
  quotes: typeof quotes;
  reminders: typeof reminders;
  routes: typeof routes;
  seed: typeof seed;
  seedTestUser: typeof seedTestUser;
  settings: typeof settings;
  testAuth: typeof testAuth;
  users: typeof users;
  vehicles: typeof vehicles;
  viktorTools: typeof viktorTools;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

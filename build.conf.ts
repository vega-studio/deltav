/**
 * These are the available and expected build output environments for the client
 * code. You should ensure that an env file exists for each environment in:
 *
 * app/config/
 *
 * For example if this module exports ["prod", "mob1", "mob2"], there should be:
 *
 * app/config/env.prod.ts
 * app/config/env.mob1.ts
 * app/config/env.mob2.ts
 *
 * The env.base contains what each configuration should inherit from and modify.
 * The env.ts file is specifically for development.
 */
export const BUILD_TARGETS = ["prod"];

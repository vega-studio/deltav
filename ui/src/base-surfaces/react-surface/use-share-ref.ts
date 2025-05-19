import React from "react";

import { BaseResourceOptions } from "../../resources";
import { PromiseResolver } from "../../util";

export type SharedResource = PromiseResolver<BaseResourceOptions | null> | null;

/**
 * Convenience hook for making it clear how to share a Resource like texture etc
 * around the component.
 */
export function useShareResource(): React.MutableRefObject<PromiseResolver<BaseResourceOptions | null> | null> {
  return React.useRef<PromiseResolver<BaseResourceOptions | null> | null>(null);
}

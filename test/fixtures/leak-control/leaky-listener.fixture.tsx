import React from "react";

import { HostContext, registerFixture } from "../fixture-registry.js";

/** The event type the leaked listener is registered for. */
export const LEAKY_LISTENER_TYPE = "deltav-leak-control";

/** Leak control: adds a window listener and never removes it. */
const LeakyListenerFixture: React.FC = () => {
  const host = React.useContext(HostContext);

  React.useEffect(() => {
    window.addEventListener(LEAKY_LISTENER_TYPE, () => {
      /* leaked on purpose */
    });
    host.ready();
  }, []);

  return null;
};

registerFixture("leak-control/leaky-listener", LeakyListenerFixture);

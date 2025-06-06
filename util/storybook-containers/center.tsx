import React from "react";

import { when } from "../when.js";
import { FillPage } from "./fill-page.js";

export const Center = ({ children, width, height, row }: any) => (
  <FillPage>
    <div
      style={{
        flex: "1 1 auto",
        display: "flex",
        flexDirection: row ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {when(
        width || height,
        <div style={{ width, height }}>{children}</div>,
        children
      )}
    </div>
  </FillPage>
);

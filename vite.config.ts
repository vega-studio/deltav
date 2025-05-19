import * as Vite from "vite";
import { useDevopsPlugins } from "./node_modules/devops/shim/index.js";

export default async (): Promise<Vite.UserConfig> => {
  const plugins = [...(await useDevopsPlugins())];

  // if (process.env.NODE_ENV === "production") {
  //   plugins = plugins
  //     .flat()
  //     .filter((p) => (p as any)?.name !== "vite-plugin-css-injected-by-js");
  // }

  return {
    plugins,
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: {},
        },
      },
    },
  };
};

import Vite from "vite";
import { useDevopsPlugins } from "./node_modules/devops/shim/devops-vite-plugins.js";

export default async (): Promise<Vite.UserConfig> => {
  return {
    plugins: [...(await useDevopsPlugins())],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {},
        },
      },
    },
  };
};

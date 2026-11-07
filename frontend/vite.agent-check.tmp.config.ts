import base from "./vite.config";

const b = base as unknown as Record<string, any>;

export default {
  ...b,
  server: {
    ...(b.server ?? {}),
    host: "127.0.0.1",
    port: 5437,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:8437",
      "/media": "http://127.0.0.1:8437",
    },
  },
};

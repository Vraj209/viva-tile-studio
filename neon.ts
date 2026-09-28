import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    buckets: {
      "viva-tile-studio": { access: "private" },
    },
  },
});

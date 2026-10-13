import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,
  preview: {
    buckets: {
      "viva-tile-studio": { access: "private" },
    },
  },
});

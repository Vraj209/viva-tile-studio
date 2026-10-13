"use client";

import { createAuthClient } from "@neondatabase/auth/next";

// Browser requests stay on this application's origin. Server credentials never reach the client.
export const authClient = createAuthClient();

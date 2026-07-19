"use client";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { getAuthBaseUrl } from "./runtime-config";

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          defaultValue: "patient",
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

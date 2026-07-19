"use client"
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000",
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: 'string',
          defaultValue: 'patient',
        }
      }
    })
  ]
})

export const { signIn, signUp, signOut, useSession } = authClient

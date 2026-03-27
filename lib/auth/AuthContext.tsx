"use client"

// ============================================================
// lib/auth/AuthContext.tsx
// Now exposes googleName and googleAvatar from user_metadata
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  // Google profile data (from OAuth user_metadata)
  googleName: string | null
  googleAvatar: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  googleName: null,
  googleAvatar: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

function extractGoogleProfile(user: User | null) {
  if (!user) return { googleName: null, googleAvatar: null }
  const meta = user.user_metadata ?? {}
  // Supabase stores Google profile under these keys
  const googleName: string | null =
    meta.full_name ?? meta.name ?? meta.email ?? null
  const googleAvatar: string | null =
    meta.avatar_url ?? meta.picture ?? null
  return { googleName, googleAvatar }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [googleName, setGoogleName] = useState<string | null>(null)
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null)
  const supabase = createClient()

  const applyUser = (u: User | null) => {
    setUser(u)
    const { googleName: n, googleAvatar: a } = extractGoogleProfile(u)
    setGoogleName(n)
    setGoogleAvatar(a)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      applyUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        applyUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    })
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, session, loading, googleName, googleAvatar, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

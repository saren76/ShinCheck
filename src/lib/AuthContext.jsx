
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setAuthError({ type: "unknown", message: error.message });
      }

      setUser(data?.session?.user ?? null);
      setIsLoadingAuth(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthError(null);
      setIsLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoadingAuth,
      authError,
      refresh: async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          setAuthError({ type: "unknown", message: error.message });
          return;
        }
        setUser(data.user);
      },
      logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          setAuthError({ type: "unknown", message: error.message });
        }
      },
      navigateToLogin: () => {
        window.location.href = "/login";
      },
    }),
    [user, isLoadingAuth, authError]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

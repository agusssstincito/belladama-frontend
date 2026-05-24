"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, loginWithGoogle, isLoading, isAuthenticated, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSuccess = searchParams.get("success") === "true";
  const next = searchParams.get("next");

  // Redirect after authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      if (next) {
        router.push(next);
      } else if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    }
  }, [isAuthenticated, user, next, router]);

  // Google Sign-In Initialization
  useEffect(() => {
    const initializeGoogle = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (typeof window !== "undefined" && (window as any).google && clientId) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
            cancel_on_tap_outside: false,
          });

          (window as any).google.accounts.id.renderButton(
            document.getElementById("google-button-container"),
            {
              theme: "outline",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              width: "100%"
            }
          );
        } catch (error) {
          console.error("Error initializing Google Identity Services:", error);
        }
      }
    };

    // If script is already loaded, initialize immediately
    if ((window as any).google) {
      initializeGoogle();
    } else {
      // Fallback: wait for the script to load (using the event listener as backup)
      window.addEventListener("load", initializeGoogle);
      return () => window.removeEventListener("load", initializeGoogle);
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setIsGoogleLoading(true);
    setError("");
    try {
      await loginWithGoogle(response.credential);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError("Error al iniciar sesión con Google. Inténtalo de nuevo.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
    } catch {
      setError("Email o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF0F5] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-[400px]"
      >
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-4xl font-bold tracking-tight text-lumiere-charcoal">
            Bella Dama
          </Link>
          <p className="text-lumiere-charcoal/60 mt-2 text-sm">
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium text-center"
          >
            Cuenta creada exitosamente. Podés iniciar sesión.
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-lumiere-charcoal mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-lumiere-warm bg-lumiere-light/50 focus:outline-none focus:ring-2 focus:ring-[#D4537E]/50 focus:border-[#D4537E] transition-all"
              placeholder="admin@belladama.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-lumiere-charcoal mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-lumiere-warm bg-lumiere-light/50 focus:outline-none focus:ring-2 focus:ring-[#D4537E]/50 focus:border-[#D4537E] transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#D4537E] text-xs text-center font-medium bg-[#FFF0F5] py-2 rounded-md"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-[#D4537E] hover:bg-[#c0466e] text-white font-medium py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Ingresando...
              </>
            ) : "Ingresar"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-lumiere-warm"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-lumiere-charcoal/40 font-medium italic">O continúa con</span>
          </div>
        </div>

        {/* Google Login Button Button */}
        <div className="w-full flex flex-col items-center">
          {isGoogleLoading ? (
            <div className="flex flex-col items-center py-4 space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4537E] border-t-transparent" />
              <p className="text-xs text-lumiere-charcoal/60 font-medium">Autenticando con Google...</p>
            </div>
          ) : (
            <div id="google-button-container" className="w-full min-h-[44px]"></div>
          )}
        </div>

        <div className="mt-8 text-center border-t border-lumiere-warm pt-6">
          <p className="text-sm text-lumiere-charcoal/60">
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="text-[#D4537E] font-medium hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFF0F5]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4537E] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

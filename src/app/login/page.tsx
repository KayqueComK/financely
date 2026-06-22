"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Landmark, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered")) {
      setSuccess("Conta criada com sucesso! Faça login abaixo.");
    }
    
    const urlError = searchParams.get("error");
    if (urlError) {
      if (urlError === "OAuthAccountNotLinked") {
        setError("Para confirmar sua identidade, faça o primeiro login usando seu e-mail e senha. Depois disso, você poderá usar o botão do Google.");
      } else {
        setError("Ocorreu um erro ao entrar com o Google. (" + urlError + ")");
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-2xl relative overflow-hidden shadow-2xl shadow-sky-900/5">

      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
          <Landmark className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Login no Financely
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Entre para gerenciar seu saldo e metas.
        </p>
      </div>

      {success && (
        <div className="p-3 mb-4 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setLoading(true);
          signIn("google", { callbackUrl: "/" });
        }}
        disabled={loading}
        className="w-full py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-900 transition-all cursor-pointer shadow-sm border border-slate-200 active:scale-98 mb-6 disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Entrar com o Google
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-slate-200 flex-1"></div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ou</span>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            E-mail
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Senha
            </label>
            <button
              type="button"
              onClick={() => alert("Apenas use a senha definida na criação da conta para logar.")}
              className="text-xs text-sky-600 hover:text-sky-500 font-medium"
            >
              Esqueceu a senha?
            </button>
          </div>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer shadow-md shadow-sky-600/20 active:scale-98"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-sky-600 hover:text-sky-500 font-bold transition">
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4 py-12 bg-slate-900">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

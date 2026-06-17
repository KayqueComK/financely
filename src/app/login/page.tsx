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
    <div className="w-full max-w-md p-8 glass rounded-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
          <Landmark className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-indigo-200 bg-clip-text text-transparent">
          Login no Financely
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Entre para gerenciar seu saldo e metas.
        </p>
      </div>

      {success && (
        <div className="p-3 mb-4 text-xs font-semibold rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 text-xs font-semibold rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            E-mail
          </label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Senha
            </label>
            <button
              type="button"
              onClick={() => alert("Apenas use a senha definida na criação da conta para logar.")}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Esqueceu a senha?
            </button>
          </div>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-98"
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

      <div className="mt-6 text-center text-xs text-slate-400">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline transition">
          Cadastre-se
        </Link>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4 py-12 bg-radial from-slate-900 via-slate-950 to-black">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 glass rounded-2xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

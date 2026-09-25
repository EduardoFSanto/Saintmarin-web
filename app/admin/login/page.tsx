"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "../../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);

      router.push("/admin");
      router.refresh();
    } catch {
      setError(
        "E-mail ou senha inválidos.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
            Saint Marin
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            Painel administrativo
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-8 shadow-xl"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Senha
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-neutral-900"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-neutral-950 px-4 py-3 font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
"use client";

import { useState, useEffect, FormEvent } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

type UserForm = { email: string; username: string; password: string };
const emptyForm: UserForm = { email: "", username: "", password: "" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchUsers() {
    try {
      const data = await api.get<User[]>("/api/users");
      setUsers(data);
    } catch {
      setError("Failed to load users");
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function startEdit(user: User) {
    setEditing(user.id);
    setForm({ email: user.email, username: user.username ?? "", password: "" });
    setError("");
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (editing !== null) {
        const body: Record<string, string> = {
          email: form.email,
          username: form.username,
        };
        if (form.password) body.password = form.password;
        await api.put<User>(`/api/users/${editing}`, body);
      } else {
        await api.post<User>("/api/users", form);
      }
      setForm(emptyForm);
      setEditing(null);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/api/users/${id}`);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Users
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 space-y-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-700"
      >
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {editing !== null ? "Edit user" : "New user"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              className="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {editing !== null
                ? "New password (leave blank to keep)"
                : "Password"}
            </label>
            <input
              type="password"
              required={editing === null}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              className="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Saving…" : editing !== null ? "Update" : "Create"}
          </button>
          {editing !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Active</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
            {users.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3 text-zinc-500">{u.id}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 text-zinc-500">{u.username ?? "—"}</td>
                <td className="px-4 py-3">{u.active ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => startEdit(u)}
                      className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

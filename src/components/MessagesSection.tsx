"use client";

import { useState, useCallback } from "react";
import MessageForm from "./MessageForm";
import type { Message } from "@/types";

type Props = {
  initialMessages: Message[];
};

export default function MessagesSection({ initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/messages");
    const data: Message[] = await res.json();
    setMessages(data);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          New message
        </h2>
        <MessageForm onSuccess={refresh} />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Messages ({messages.length})
        </h2>
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No messages yet. Be the first!
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {msg.name}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {msg.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

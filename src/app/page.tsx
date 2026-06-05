import { getMessages } from "@/lib/dal/messages";
import MessagesSection from "@/components/MessagesSection";

export default async function Home() {
  const messages = await getMessages();

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Fullstack test
      </h1>
      <MessagesSection initialMessages={messages} />
    </main>
  );
}

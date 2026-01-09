import { createClient } from "@/core/database/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, conversations: [], messagesByConversation: {} as Record<string, any[]> };
  }

  const { data: conversations = [] } = await supabase
    .from("conversations")
    .select("id, subject, conversation_type, status, last_message_at, initiator_id, recipient_id")
    .or(`initiator_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  const conversationIds = conversations.map((c) => c.id);

  const { data: messages = [] } =
    conversationIds.length === 0
      ? { data: [] }
      : await supabase
          .from("messages")
          .select("id, conversation_id, sender_id, content, created_at, status")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false });

  const grouped = conversationIds.reduce<Record<string, any[]>>((acc, id) => {
    acc[id] = messages.filter((m) => m.conversation_id === id);
    return acc;
  }, {});

  return { user, conversations, messagesByConversation: grouped };
}

export async function sendMessage(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const conversationId = String(formData.get("conversationId") || "");
  const content = String(formData.get("content") || "").trim();

  if (!conversationId || !content) {
    throw new Error("Message content is required");
  }

  const { error } = await supabase
    .from("messages")
    // @ts-expect-error Supabase type inference
    .insert({
      conversation_id: conversationId,
      sender_id: user!.id,
      content,
      status: "sent",
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inbox");
}

export default async function InboxPage() {
  const { user, conversations, messagesByConversation } = await getContext();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">Inbox</h1>
        <p className="text-sm text-gray-600">View and reply to conversations you are part of.</p>
      </header>

      {conversations.length === 0 ? (
        <p className="text-sm text-gray-600">No conversations yet.</p>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-500">{conv.conversation_type}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {conv.subject || "Conversation"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {conv.status} · Last message:{" "}
                    {conv.last_message_at ? new Date(conv.last_message_at).toLocaleString() : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                {(messagesByConversation[conv.id] || []).slice(0, 5).map((msg) => (
                  <div key={msg.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800">
                    <p className="text-xs text-gray-500">
                      {msg.sender_id === user!.id ? "You" : "Participant"} •{" "}
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                    <p>{msg.content}</p>
                  </div>
                ))}
                {(messagesByConversation[conv.id] || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No messages yet.</p>
                ) : null}
              </div>

              <form action={sendMessage} className="mt-4 space-y-2">
                <input type="hidden" name="conversationId" value={conv.id} />
                <textarea
                  name="content"
                  rows={2}
                  placeholder="Type a reply..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
                >
                  Send
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { createClient } from "@/core/database/server";
import Link from "next/link";
import { redirect } from "next/navigation";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return user;
}

export default async function InboxPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Inbox</h1>
        <p className="text-sm text-gray-600">
          Conversations with customers and inquiries will appear here.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-700">
          Messaging for merchants is on the way. We will wire conversations/messages with participant-based RLS so you
          can reply securely to your customers.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/dashboard" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
            Back to dashboard
          </Link>
          <Link href="/listings" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Go to listings
          </Link>
        </div>
      </div>
    </div>
  );
}


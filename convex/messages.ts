import { internal } from "./_generated/api";
import { internalMutation, mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const list = query(async ({ db }): Promise<Doc<"messages">[]> => {
  return await db.query("messages").collect();
});

export const send = mutation(
  async (
    { db, scheduler },
    { body, author }: { body: string; author: string }
  ) => {
    const message = { body, author };
    await db.insert("messages", message);

    if (message.body.endsWith("?")) {
      const messages = await db.query("messages").collect();
      const messageId = await db.insert("messages", {
        author: "ChatGPT",
        body: "...",
      });
      scheduler.runAfter(0, internal.openai.chat, { messages, messageId });
    }
  }
);

export const update = internalMutation(
  async (
    { db },
    { messageId, body }: { messageId: Id<"messages">; body: string }
  ) => {
    await db.patch(messageId, { body });
  }
);

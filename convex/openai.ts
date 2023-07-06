"use node";
import { OpenAI } from "openai";
import { internalAction } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

type ChatParams = {
  messages: Doc<"messages">[];
  messageId: Id<"messages">;
};
export const chat = internalAction(
  async ({ runMutation }, { messages, messageId }: ChatParams) => {
    const apiKey = process.env.OPENAI_API_KEY!;
    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        {
          role: "system" as const,
          content: "You are a terse bot in a group chat responding to q's.",
        },
        ...messages.map(({ body, author }) =>
          author === "ChatGPT"
            ? {
                role: "assistant" as const,
                content: body,
              }
            : {
                role: "user" as const,
                content: author + ": " + body,
              }
        ),
      ],
    });
    let body = "";
    for await (const part of stream) {
      if (part.choices[0].delta?.content) {
        body += part.choices[0].delta.content;
      } else if (part.choices[0].finish_reason === "length") {
        body += "...[truncated]";
      } else {
        continue;
      }
      await runMutation(internal.messages.update, {
        messageId,
        body,
      });
    }
  }
);

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import OpenAI from "openai";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

const http = httpRouter();

export function hasDelimeter(response: string) {
  return (
    response.includes("\n") ||
    response.includes(".") ||
    response.includes("?") ||
    response.includes("!") ||
    response.includes(",") ||
    response.length > 100
  );
}

http.route({
  path: "/chat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const messageId: Id<"messages"> = body.messageId;
    const messages: Doc<"messages">[] = body.messages;
    const openai = new OpenAI();

    // Create a TransformStream to handle streaming data
    let { readable, writable } = new TransformStream();
    let writer = writable.getWriter();
    const textEncoder = new TextEncoder();

    const streamData = async () => {
      let content = "";
      try {
        const stream = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a really excited bot in a group chat responding to q's.",
            },
            ...messages.map(({ body, author }) => ({
              role:
                author === "ChatGPT"
                  ? ("assistant" as const)
                  : ("user" as const),
              content: body,
            })),
          ],
          stream: true,
        });
        // loop over the data as it is streamed and write to the writeable
        // also periodically update the message in the database
        let partsProcessed = 0;

        for await (const part of stream) {
          const text = part.choices[0]?.delta?.content || "";
          content += text;
          await writer.write(textEncoder.encode(text));
          if (hasDelimeter(text)) {
            await ctx.runMutation(internal.messages.update, {
              messageId,
              body: content,
              isComplete: false,
            });
          }
        }
        await ctx.runMutation(internal.messages.update, {
          messageId,
          body: content,
          isComplete: true,
        });
        await writer.close();
      } catch (e) {
        if (e instanceof OpenAI.APIError) {
          console.error(e.status);
          console.error(e.message);
          await ctx.runMutation(internal.messages.update, {
            messageId,
            body: "OpenAI call failed: " + e.message,
            isComplete: true,
          });
          return;
        } else {
          throw e;
        }
      }
    };
    void streamData();

    // Send the readable back to the browser
    return new Response(readable, {
      // CORS headers -- https://docs.convex.dev/functions/http-actions#cors
      headers: {
        "Access-Control-Allow-Origin": "*",
        Vary: "origin",
      },
    });
  }),
});

// Taken from https://docs.convex.dev/functions/http-actions#cors
http.route({
  path: "/chat",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Digest",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;

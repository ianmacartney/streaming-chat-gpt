import { api } from "./_generated/api";
import { MutationCtx, internalMutation } from "./_generated/server";

const seedMessages = [
  ["Ian", "Hey, glad you're here.", 0],
  ["Abhi", "What's up?", 1000],
  ["Ian", "I'm hoping to show how reactive Convex is.", 1500],
  ["Abhi", "Could you show streaming a ChatGPT response?", 1700],
  ["Ian", "By updating the DB and having the query reflow?", 3000],
  ["Abhi", "Yeah. @gpt do you think that's a good idea?", 2000],
  ["Ian", "Very clever! Let's see what it thinks.", 600],
  ["Ian", "Thanks @gpt!", 5000],
] as const;

if (!process.env.OPENAI_API_KEY) {
  const deploymentName = process.env.CONVEX_CLOUD_URL?.slice(8).replace(
    ".convex.cloud",
    ""
  );
  throw new Error(
    "\n  Missing OPENAI_API_KEY in environment variables.\n\n" +
      "  Get one at https://openai.com/ and paste it on the Convex dashboard:\n" +
      `  https://dashboard.convex.dev/d/${deploymentName}/settings?var=OPENAI_API_KEY`
  );
}

// A plain helper, because Convex no longer lets one registered function call
// another directly (the default export below used to call `seed(ctx, {})`).
async function scheduleSeedMessages(ctx: MutationCtx) {
  let totalDelay = 0;
  for (const [author, body, delay] of seedMessages) {
    totalDelay += delay;
    await ctx.scheduler.runAfter(totalDelay, api.messages.send, {
      author,
      body,
    });
  }
}

export const seed = internalMutation({
  handler: scheduleSeedMessages,
});

export default internalMutation({
  handler: async (ctx) => {
    const anyMessage = await ctx.db.query("messages").first();
    if (anyMessage) return;
    await scheduleSeedMessages(ctx);
  },
});

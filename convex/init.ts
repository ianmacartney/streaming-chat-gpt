import { api } from "./_generated/api";
import { internalMutation } from "./_generated/server";

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

export const seed = internalMutation({
  handler: async ({ db, scheduler }) => {
    let totalDelay = 0;
    for (const [author, body, delay] of seedMessages) {
      totalDelay += delay;
      await scheduler.runAfter(totalDelay, api.messages.send, { author, body });
    }
  },
});

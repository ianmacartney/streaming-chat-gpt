# Streaming Chat Completions

An example of streaming ChatGPT via the OpenAI v4.0 node SDK.
See [this Stack post](https://stack.convex.dev/gpt-streaming-with-persistent-reactivity) for more information.

![Diagram of browsers talking to Convex, which talks to OpenAI](https://cdn.sanity.io/images/ts10onj4/production/9a7b8865f6cd1cb6748fdb88c986d6ec7bd26bdb-1200x638.png "Data flow overview")

## Overview:

This app makes up a name for your user using Faker.js and allows you to
chat with other users: open up multiple tabs to try it out!

If your message includes "@gpt" it will kick off a request to OpenAI's
[chat completion API](https://platform.openai.com/docs/api-reference/completions/create)
and stream the response, updating the message as data comes back from OpenAI.

- The frontend logic is all in [`App.tsx`](./src/App.tsx).
- The server logic that stores and updates messages in the database
  is in [`messages.ts`](./convex/messages.ts).
- The asynchronous server function that makes the streaming request to OpenAI
  is in [`openai.ts`](./convex/openai.ts).
- The initial messages that are scheduled to be sent are in
  [`init.ts`](./convex/init.ts).

## Running the App

1. Install dependencies

   ```
   npm install && npx convex dev --once
   ```

2. Get an [OpenAI](https://platform.openai.com/) API key.
3. Set the environment variable: `OPEN_API_KEY` (should start with `sk-`)
   in your Convex backend via the dashboard (`npx convex dashboard`).

   ```
   npx convex dashboard
   ```

4. Start the frontend and backend

   ```
   npm run dev
   ```

This will start two processes in one terminal: `vite` for the frontend, and
`npx convex dev` for syncing changes to Convex server functions.

Before running these commands, it will do a one-time sync of convex functions,
and (if the database is empty) schedule some messages to be sent so you can see
it working in action (`convex run init`).

You can look at how this is configured in the `scripts` section of [package.json](./package.json).

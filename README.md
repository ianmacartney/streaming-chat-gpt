# Streaming Chat Completions

An example of streaming ChatGPT via the OpenAI v4.0 node SDK built off of [this repo](https://github.com/ianmacartney/streaming-chat-gpt)
with [this accompanying Stack post](https://stack.convex.dev/gpt-streaming-with-persistent-reactivity).

However this app uses an [HTTP endpoint](https://docs.convex.dev/functions/http-actions) with response streaming to send the ChatGPT response to the message author without having to update the database on every streamed part.

The result is that the author of a message sees frequent updates to their message, while any other viewers receive batched updates, and the app overall requires less database bandwidth.

![Diagram of browsers talking to Convex, which talks to OpenAI](/overview.png "Data flow overview")

![Demo of message streaming from OpenAI with two different users](/gpt_stream.gif "Demo of message streamin")

## Overview:

This app makes up a name for your user using Faker.js and allows you to
chat with other users: open up multiple tabs to try it out!

If your message includes "@gpt" it will kick off a request to OpenAI's
[chat completion API](https://platform.openai.com/docs/api-reference/completions/create)
and stream the response, updating the message as data comes back from OpenAI.

- The frontend logic is all in [`App.tsx`](./src/App.tsx).
- The server logic that stores and updates messages in the database
  is in [`messages.ts`](./convex/messages.ts).
- The HTTP endpoint that makes the streaming request to OpenAI
  is in [`http.ts`](./convex/http.ts).
- The initial messages that are scheduled to be sent are in
  [`init.ts`](./convex/init.ts).

## Running the App

```
npm install
npm run dev
```

This will configure a Convex project if you don't already have one.
It requires an [OpenAI](https://platform.openai.com/) API key.
Set the environment variable: `OPEN_API_KEY` (should start with `sk-`)
in your Convex backend via the [dashboard](https://dashboard.convex.dev)
once your backend has been configured. You can also get there via:

```
npx convex dashboard
```

Once `npm run dev` successfully syncs, if the database is empty,
it will schedule some messages to be sent so you can see it working in action.

It will then start two processes in one terminal: `vite` for the frontend,
and `npx convex dev` for syncing changes to Convex server functions.

Check it out in the `scripts` section of [package.json](./package.json).

# What is Convex?

[Convex](https://convex.dev) is a hosted backend platform with a
built-in database that lets you write your
[database schema](https://docs.convex.dev/database/schemas) and
[server functions](https://docs.convex.dev/functions) in
[TypeScript](https://docs.convex.dev/typescript). Server-side database
[queries](https://docs.convex.dev/functions/query-functions) automatically
[cache](https://docs.convex.dev/functions/query-functions#caching--reactivity) and
[subscribe](https://docs.convex.dev/client/react#reactivity) to data, powering a
[realtime `useQuery` hook](https://docs.convex.dev/client/react#fetching-data) in our
[React client](https://docs.convex.dev/client/react). There are also
[Python](https://docs.convex.dev/client/python),
[Rust](https://docs.convex.dev/client/rust),
[ReactNative](https://docs.convex.dev/client/react-native), and
[Node](https://docs.convex.dev/client/javascript) clients, as well as a straightforward
[HTTP API](https://github.com/get-convex/convex-js/blob/main/src/browser/http_client.ts#L40).

The database support
[NoSQL-style documents](https://docs.convex.dev/database/document-storage) with
[relationships](https://docs.convex.dev/database/document-ids) and
[custom indexes](https://docs.convex.dev/database/indexes/)
(including on fields in nested objects).

The
[`query`](https://docs.convex.dev/functions/query-functions) and
[`mutation`](https://docs.convex.dev/functions/mutation-functions) server functions have transactional,
low latency access to the database and leverage our
[`v8` runtime](https://docs.convex.dev/functions/runtimes) with
[determinism guardrails](https://docs.convex.dev/functions/runtimes#using-randomness-and-time-in-queries-and-mutations)
to provide the strongest ACID guarantees on the market:
immediate consistency,
serializable isolation, and
automatic conflict resolution via
[optimistic multi-version concurrency control](https://docs.convex.dev/database/advanced/occ) (OCC / MVCC).

The [`action` server functions](https://docs.convex.dev/functions/actions) have
access to external APIs and enable other side-effects and non-determinism in
either our
[optimized `v8` runtime](https://docs.convex.dev/functions/runtimes) or a more
[flexible `node` runtime](https://docs.convex.dev/functions/runtimes#nodejs-runtime).

Functions can run in the background via
[scheduling](https://docs.convex.dev/scheduling/scheduled-functions) and
[cron jobs](https://docs.convex.dev/scheduling/cron-jobs).

Development is cloud-first, with
[hot reloads for server function](https://docs.convex.dev/cli#run-the-convex-dev-server) editing via the
[CLI](https://docs.convex.dev/cli). There is a
[dashbord UI](https://docs.convex.dev/dashboard) to
[browse and edit data](https://docs.convex.dev/dashboard/deployments/data),
[edit environment variables](https://docs.convex.dev/production/environment-variables),
[view logs](https://docs.convex.dev/dashboard/deployments/logs),
[run server functions](https://docs.convex.dev/dashboard/deployments/functions), and more.

There are built-in features for
[reactive pagination](https://docs.convex.dev/database/pagination),
[file storage](https://docs.convex.dev/file-storage),
[reactive search](https://docs.convex.dev/text-search),
[https endpoints](https://docs.convex.dev/functions/http-actions) (for webhooks),
[streaming import/export](https://docs.convex.dev/database/import-export/), and
[runtime data validation](https://docs.convex.dev/database/schemas#validators) for
[function arguments](https://docs.convex.dev/functions/args-validation) and
[database data](https://docs.convex.dev/database/schemas#schema-validation).

Everything scales automatically, and it’s [free to start](https://www.convex.dev/plans).

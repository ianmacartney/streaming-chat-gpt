# Streaming Chat Completions

 An example of streaming  ChatGPT via the OpenAI v4.0 node SDK.
 See [this Stack post](TODO) for more information.

## Overview:

This app makes up a name for your user using Faker.js and allows you to
chat with other users.

If your message includes "@gpt" it will kick off a request to OpenAI's
[chat completion](https://platform.openai.com/docs/api-reference/completions/create)
and stream the response, updating the message as data comes back from OpenAI.

## Setup

1. `npm install && npx convex init`.
2. Get an [OpenAI](https://platform.openai.com/) API key.
3. Set the environment variable: `OPEN_API_KEY` (should start with `sk-`) in
your Convex backend via the [dashboard](https://dashboard.convex.dev).

## Running the App

```
npm install
npm run dev
```

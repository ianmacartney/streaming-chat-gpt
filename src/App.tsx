import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { faker } from "@faker-js/faker";
import { Doc, Id } from "../convex/_generated/dataModel";

// For demo purposes. In a real app, you'd have real user data.
const NAME = faker.person.firstName();
export default function App() {
  const messages = useQuery(api.messages.list) ?? [];
  const sendMessage = useMutation(api.messages.send);
  const [newMessageText, setNewMessageText] = useState("");

  // Hold state for a message we're streaming from ChatGPT via an HTTP endpoint,
  // which we'll apply on top
  const [streamedMessage, setStreamedMessage] = useState("");
  const [streamedMessageId, setStreamedMessageId] =
    useState<Id<"messages"> | null>(null);

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, [messages, streamedMessage]);
  useEffect(() => {
    const message = messages.find((m) => m._id === streamedMessageId);
    if (message !== undefined && message.isComplete) {
      // Clear what we streamed in favor of the complete message
      setStreamedMessageId(null);
      setStreamedMessage("");
    }
  }, [messages, setStreamedMessage, setStreamedMessageId]);

  return (
    <main className="chat">
      <header>
        <h1>Acme Chat</h1>
        <p>
          Connected as <strong>{NAME}</strong>
        </p>
      </header>
      {messages.map((message) => {
        const messageText =
          streamedMessageId === message._id ? streamedMessage : message.body;
        return (
          <article
            key={message._id}
            className={message.author === NAME ? "message-mine" : ""}
          >
            <div>{message.author}</div>
            <p>{messageText}</p>
          </article>
        );
      })}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const result = await sendMessage({
            body: newMessageText,
            author: NAME,
          });
          setNewMessageText("");
          // Kick off ChatGPT response + stream the result
          if (result !== null) {
            const messageId = result.messageId;
            setStreamedMessageId(messageId);
            await handleGptResponse((text) => {
              setStreamedMessage((p) => p + text);
            }, result);
          }
        }}
      >
        <input
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          placeholder="Write a message…"
        />
        <button type="submit" disabled={!newMessageText}>
          Send
        </button>
      </form>
    </main>
  );
}

async function handleGptResponse(
  onUpdate: (update: string) => void,
  requestBody: { messageId: Id<"messages">; messages: Doc<"messages">[] }
) {
  const convexSiteUrl = import.meta.env.VITE_CONVEX_URL.replace(
    /\.cloud$/,
    ".site"
  );
  const response = await fetch(`${convexSiteUrl}/chat`, {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: { "Content-Type": "application/json" },
  });
  // Taken from https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
  const responseBody = response.body;
  if (responseBody === null) {
    return;
  }
  const reader = responseBody.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      onUpdate(new TextDecoder().decode(value));
      return;
    }
    onUpdate(new TextDecoder().decode(value));
  }
}

"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markMessagesRead } from "../../actions";

export default function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
  otherProfile,
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          // Mark as read if from the other person
          if (payload.new.sender_id !== currentUserId) {
            markMessagesRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);

    // Optimistic add
    const optimistic = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: input.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    const result = await sendMessage(conversationId, input.trim());

    if (result.error) {
      // Remove optimistic on error
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } else if (result.message) {
      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? result.message : m))
      );
    }

    setSending(false);
    inputRef.current?.focus();
  }

  return (
    <>
      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-[14px] text-mute">
              No messages yet. Say hello!
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const previous = messages[index - 1];
          const isOwn = msg.sender_id === currentUserId;
          const showAvatar = msg.sender_id !== previous?.sender_id;
          const msgDate = new Date(msg.created_at).toLocaleDateString();
          const previousDate = previous
            ? new Date(previous.created_at).toLocaleDateString()
            : null;
          const showDate = msgDate !== previousDate;

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="my-4 flex items-center gap-3">
                  <div className="flex-1 border-t border-line" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mute">
                    {formatDate(msg.created_at)}
                  </span>
                  <div className="flex-1 border-t border-line" />
                </div>
              )}

              <div
                className={`flex gap-2 px-1 ${
                  isOwn ? "justify-end" : "justify-start"
                } ${showAvatar ? "mt-3" : "mt-0.5"}`}
              >
                {/* Other user avatar */}
                {!isOwn && showAvatar && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-[11px] font-bold text-terra">
                    {(otherProfile?.full_name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                {!isOwn && !showAvatar && <div className="w-7 shrink-0" />}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isOwn
                      ? "bg-ink text-paper-2"
                      : "border border-line bg-paper text-ink"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      isOwn ? "text-paper-2/60" : "text-mute"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-3 border-t border-line pt-4"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Type a message..."
          rows={1}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-line-2 bg-paper px-4 py-3 text-[14px] text-ink placeholder:text-mute outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink/10"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-terra text-white transition-colors hover:bg-terra-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </>
  );
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

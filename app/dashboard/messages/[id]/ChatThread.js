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

  // Group consecutive messages from the same sender
  let lastSenderId = null;
  let lastDate = null;

  return (
    <>
      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-muted">
              No messages yet. Say hello!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          const showAvatar = msg.sender_id !== lastSenderId;
          const msgDate = new Date(msg.created_at).toLocaleDateString();
          const showDate = msgDate !== lastDate;

          lastSenderId = msg.sender_id;
          lastDate = msgDate;

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="my-4 flex items-center gap-3">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-xs text-text-muted">
                    {formatDate(msg.created_at)}
                  </span>
                  <div className="flex-1 border-t border-border" />
                </div>
              )}

              <div
                className={`flex gap-2 px-1 ${
                  isOwn ? "justify-end" : "justify-start"
                } ${showAvatar ? "mt-3" : "mt-0.5"}`}
              >
                {/* Other user avatar */}
                {!isOwn && showAvatar && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-light text-xs font-semibold text-orange-400">
                    {(otherProfile?.full_name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                {!isOwn && !showAvatar && <div className="w-7 shrink-0" />}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isOwn
                      ? "bg-orange-500 text-white"
                      : "bg-surface-light text-text-primary"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </p>
                  <p
                    className={`mt-1 text-right text-[10px] ${
                      isOwn ? "text-white/60" : "text-text-muted"
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
        className="flex items-end gap-3 border-t border-border pt-4"
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
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
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

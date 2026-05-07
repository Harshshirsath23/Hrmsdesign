import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Mic, Minimize2, SendHorizontal, Sparkles, X } from "lucide-react";
import { useIsMobile } from "../ui/use-mobile";
import { useAssistantStore } from "../../modules/assistant/store";

export function FloatingAssistant() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const {
    isOpen,
    unreadCount,
    suggestions,
    activeModule,
    messages,
    isTyping,
    open,
    close,
    sendMessage,
    setContext,
  } = useAssistantStore();

  useEffect(() => {
    setContext(location.pathname);
  }, [location.pathname, setContext]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, isTyping]);

  const onlineLabel = useMemo(() => `Online - ${activeModule} context`, [activeModule]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-[rgba(20,24,32,0.24)] backdrop-blur-[3px]"
            aria-label="Close assistant overlay"
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed bottom-5 right-5 z-50 md:bottom-7 md:right-7">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.button
              key="assistant-orb"
              initial={{ scale: 0.85, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              onClick={open}
              className="assistant-orb pointer-events-auto relative flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-[linear-gradient(145deg,rgba(255,255,255,0.56),rgba(255,255,255,0.26))] text-slate-700 shadow-[0_14px_35px_rgba(125,132,163,0.28)] backdrop-blur-xl dark:border-white/15 dark:bg-[linear-gradient(145deg,rgba(73,80,87,0.52),rgba(52,58,64,0.32))] dark:text-slate-100"
              aria-label="Open AI assistant"
            >
              <Sparkles className="h-5 w-5" />
              <span className="assistant-orb-reflection absolute inset-0 rounded-full" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[rgba(255,99,132,0.95)] px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>
          ) : (
            <motion.div
              key="assistant-panel"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className={`pointer-events-auto overflow-hidden border border-white/45 bg-[linear-gradient(155deg,rgba(255,255,255,0.62),rgba(255,255,255,0.36))] shadow-[0_22px_45px_rgba(129,140,170,0.32)] backdrop-blur-2xl dark:border-white/15 dark:bg-[linear-gradient(155deg,rgba(52,58,64,0.72),rgba(52,58,64,0.46))] ${
                isMobile
                  ? "fixed inset-x-0 bottom-0 h-[86vh] w-screen rounded-t-[26px]"
                  : "h-[630px] w-[390px] rounded-[24px]"
              }`}
            >
              <div className="border-b border-white/35 px-4 py-3 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/45 bg-white/40 dark:border-white/15 dark:bg-white/5">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">AI Assistant</p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{onlineLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={close}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/35 bg-white/35 text-muted-foreground transition hover:bg-white/55 hover:text-foreground dark:border-white/15 dark:bg-white/5"
                      aria-label="Minimize assistant"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={close}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/35 bg-white/35 text-muted-foreground transition hover:bg-white/55 hover:text-foreground dark:border-white/15 dark:bg-white/5"
                      aria-label="Close assistant"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-[calc(100%-156px)] overflow-y-auto px-3 py-3">
                <div className="mb-3 flex flex-wrap gap-2 px-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="rounded-full border border-white/45 bg-white/50 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:-translate-y-0.5 hover:bg-white/70 hover:text-foreground dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 px-1 pb-2">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
                          message.role === "user"
                            ? "rounded-br-md border border-sky-200/60 bg-sky-500/85 text-white dark:border-sky-400/20 dark:bg-sky-500/60"
                            : "rounded-bl-md border border-white/55 bg-white/65 text-foreground dark:border-white/10 dark:bg-white/8"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md border border-white/55 bg-white/65 px-3 py-2 dark:border-white/10 dark:bg-white/8">
                        <div className="assistant-typing flex items-center gap-1.5">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/35 px-3 py-3 dark:border-white/10">
                <div className="flex items-center gap-2 rounded-2xl border border-white/45 bg-white/50 px-2 py-2 backdrop-blur-md dark:border-white/15 dark:bg-white/5">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask anything about HR workflows..."
                    className="h-8 flex-1 bg-transparent px-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/60 hover:text-foreground dark:hover:bg-white/10"
                    aria-label="Voice input"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/90 text-white transition hover:bg-slate-800 dark:bg-slate-200/90 dark:text-slate-900 dark:hover:bg-slate-200"
                    aria-label="Send message"
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

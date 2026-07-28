"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { Send, Mic, Loader2 } from "lucide-react";

export default function ChatInterface() {
  const { messages, isTyping, sendMessage, isRecording, voiceMode } =
    useAppContext();
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (voiceMode) {
      inputRef.current?.focus();
    }
  }, [voiceMode]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{
          scrollBehavior: "smooth",
          background:
            "radial-gradient(ellipse at center, #1a1a3e 0%, #0a0a1a 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="glass border-t border-[#e94560]/20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          {/* Voice Mode Indicator */}
          {voiceMode && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#e94560]/10 border border-[#e94560]/30">
              <Mic size={16} className="text-[#e94560] animate-pulse" />
              <span className="text-xs text-[#e94560] font-medium">
                Voice Mode
              </span>
            </div>
          )}

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                voiceMode
                  ? "Speak or type your message..."
                  : "Type your message..."
              }
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-[#0a0a1a] border border-[#e94560]/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560] transition-all resize-none"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />

            {/* Character Count */}
            {inputMessage.length > 0 && (
              <span className="absolute right-14 bottom-2 text-xs text-gray-500">
                {inputMessage.length}
              </span>
            )}
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className={`p-3 rounded-xl transition-all ${
              inputMessage.trim() && !isTyping
                ? "bg-gradient-to-r from-[#e94560] to-[#c23152] text-white hover:shadow-lg hover:shadow-[#e94560]/30"
                : "bg-[#16213e] text-gray-500 cursor-not-allowed"
            }`}
          >
            {isTyping ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>

        {/* Mode Toggle Hint */}
        <div className="max-w-4xl mx-auto mt-2 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {voiceMode
              ? "🎤 Voice mode active - click the mic to speak"
              : "⌨️ Type your message or switch to voice mode"}
          </span>
          <span className="text-xs text-gray-500">
            {messages.length} messages
          </span>
        </div>
      </div>
    </div>
  );
}

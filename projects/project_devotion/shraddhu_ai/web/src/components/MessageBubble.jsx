import { motion } from "framer-motion";
import { User, Sparkles, Mic, Volume2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MessageBubble({ message }) {
  const isUser = message.type === "user";
  const isVoice = message.isVoice || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-[#16213e] border border-[#e94560]/30 flex items-center justify-center">
            <User size={16} className="text-gray-300" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#e94560] to-[#c23152] flex items-center justify-center glow-pulse">
            <Sparkles size={16} className="text-white" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[80%] md:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-gradient-to-r from-[#e94560] to-[#c23152] text-white rounded-br-none"
              : "glass text-gray-200 rounded-bl-none border border-[#e94560]/10"
          }`}
        >
          {isVoice && isUser && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Mic size={12} className="text-pink-300" />
              <span className="text-[10px] text-pink-200 font-medium">
                Voice
              </span>
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.timestamp), {
              addSuffix: true,
            })}
          </span>
          {isVoice && isUser && (
            <span className="text-[10px] text-[#e94560] flex items-center gap-1">
              <Volume2 size={10} />
              Voice
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

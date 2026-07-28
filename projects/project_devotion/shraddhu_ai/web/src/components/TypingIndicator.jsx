export default function TypingIndicator() {
  return (
    <div className="glass px-4 py-3 rounded-2xl rounded-bl-none border border-[#e94560]/10">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Shraddhu AI is typing</span>
        <div className="flex items-center gap-1 ml-1">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
      </div>
    </div>
  );
}

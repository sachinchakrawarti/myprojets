'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import ChatInterface from '@/components/ChatInterface';
import VoiceControls from '@/components/VoiceControls';
import Sidebar from '@/components/Sidebar';
import { Mic, Menu, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const { isConnected, setIsConnected, messages, sendMessage } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Auto-connect to WebSocket
    if (!isConnected) {
      setIsConnected(true);
    }

    // Hide welcome after 3 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-[#0a0a1a]">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="glass px-4 py-3 flex items-center justify-between border-b border-[#e94560]/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white transition-colors md:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#e94560] to-[#c23152] flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-[#e94560] to-pink-400 bg-clip-text text-transparent">
                Shraddhu AI
              </h1>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-400">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.success('Voice mode ready! 🎤')}
              className="p-2 rounded-lg bg-[#e94560]/10 text-[#e94560] hover:bg-[#e94560]/20 transition-colors"
            >
              <Mic size={18} />
            </button>
          </div>
        </header>

        {/* Welcome Overlay */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0a1a]/80 backdrop-blur-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#e94560] to-[#c23152] flex items-center justify-center glow-pulse">
                  <Sparkles size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Shraddhu AI</h2>
                <p className="text-gray-400">Your J.A.R.V.I.S. is ready to assist you ✨</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Interface */}
        <ChatInterface />

        {/* Voice Controls */}
        <VoiceControls />
      </div>
    </div>
  );
}
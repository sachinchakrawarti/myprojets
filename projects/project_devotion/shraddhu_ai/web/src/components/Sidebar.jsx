"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MessageSquare,
  Settings,
  History,
  Star,
  Sparkles,
  Heart,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import SettingsModal from "./SettingsModal";

export default function Sidebar({ open, setOpen }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const { messages } = useAppContext();

  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: MessageSquare, label: "Chat", active: false },
    { icon: History, label: "History", active: false },
    { icon: Star, label: "Favorites", active: false },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed md:relative z-50 h-full w-72 glass border-r border-[#e94560]/10 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#e94560]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#e94560] to-[#c23152] flex items-center justify-center glow-pulse">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Shraddhu AI</h2>
              <p className="text-xs text-gray-400">
                ✨ Your personal assistant
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-[#e94560]/10">
          <div className="glass rounded-lg p-3 border border-[#e94560]/10">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Messages</span>
              <span className="text-sm font-semibold text-white">
                {messages.length}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">Status</span>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ x: 5 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                item.active
                  ? "bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/30"
                  : "text-gray-400 hover:text-white hover:bg-[#e94560]/10"
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
              {item.active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e94560]"></span>
              )}
            </motion.button>
          ))}

          {/* Quick Actions */}
          <div className="pt-4 mt-4 border-t border-[#e94560]/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Quick Actions
            </p>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#e94560]/10 transition-all">
              <Heart size={18} className="text-[#e94560]" />
              <span className="text-sm">Support Shraddhu</span>
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#e94560]/10 transition-all"
            >
              <Settings size={18} />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e94560]/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">v1.0.0</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg bg-[#16213e] text-gray-400 hover:text-white transition-colors"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

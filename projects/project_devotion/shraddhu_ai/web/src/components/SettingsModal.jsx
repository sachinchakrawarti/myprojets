"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Volume2,
  Mic,
  Sparkles,
  Globe,
  Moon,
  Sun,
  Save,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

export default function SettingsModal({ isOpen, onClose }) {
  const { voiceMode, setVoiceMode } = useAppContext();
  const [settings, setSettings] = useState({
    voiceMode: voiceMode,
    language: "en",
    theme: "dark",
    autoStart: false,
    voiceSpeed: 1.0,
    voicePitch: 1.0,
  });

  const handleSave = () => {
    setVoiceMode(settings.voiceMode);
    toast.success("Settings saved successfully! ✨");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass w-full max-w-md rounded-2xl border border-[#e94560]/20 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#e94560]/10">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Settings size={20} className="text-[#e94560]" />
                  Settings
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[#e94560]/10 transition-colors text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Voice Mode Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#16213e]/50 border border-[#e94560]/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#e94560]/10">
                      <Mic size={18} className="text-[#e94560]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Voice Mode
                      </p>
                      <p className="text-xs text-gray-400">
                        Enable voice interactions
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        voiceMode: !settings.voiceMode,
                      })
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.voiceMode ? "bg-[#e94560]" : "bg-[#16213e]"
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                      animate={{ x: settings.voiceMode ? 26 : 2 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>

                {/* Language Selector */}
                <div className="p-3 rounded-lg bg-[#16213e]/50 border border-[#e94560]/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-[#e94560]/10">
                      <Globe size={18} className="text-[#e94560]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Language</p>
                      <p className="text-xs text-gray-400">
                        Choose your preferred language
                      </p>
                    </div>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      setSettings({ ...settings, language: e.target.value })
                    }
                    className="w-full bg-[#0a0a1a] text-white rounded-lg px-3 py-2 text-sm border border-[#e94560]/20 focus:outline-none focus:border-[#e94560] transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="gu">Gujarati</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>

                {/* Theme Selector */}
                <div className="p-3 rounded-lg bg-[#16213e]/50 border border-[#e94560]/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-[#e94560]/10">
                      {settings.theme === "dark" ? (
                        <Moon size={18} className="text-[#e94560]" />
                      ) : (
                        <Sun size={18} className="text-[#e94560]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Theme</p>
                      <p className="text-xs text-gray-400">
                        Dark or Light mode
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setSettings({ ...settings, theme: "dark" })
                      }
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                        settings.theme === "dark"
                          ? "bg-[#e94560] text-white"
                          : "bg-[#0a0a1a] text-gray-400 hover:text-white"
                      }`}
                    >
                      🌙 Dark
                    </button>
                    <button
                      onClick={() =>
                        setSettings({ ...settings, theme: "light" })
                      }
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                        settings.theme === "light"
                          ? "bg-[#e94560] text-white"
                          : "bg-[#0a0a1a] text-gray-400 hover:text-white"
                      }`}
                    >
                      ☀️ Light
                    </button>
                  </div>
                </div>

                {/* Voice Speed & Pitch */}
                <div className="p-3 rounded-lg bg-[#16213e]/50 border border-[#e94560]/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-[#e94560]/10">
                      <Volume2 size={18} className="text-[#e94560]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Voice Settings
                      </p>
                      <p className="text-xs text-gray-400">
                        Adjust speed and pitch
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Speed</span>
                        <span>{settings.voiceSpeed.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={settings.voiceSpeed}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            voiceSpeed: parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-1 bg-[#0a0a1a] rounded-lg appearance-none cursor-pointer accent-[#e94560]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Pitch</span>
                        <span>{settings.voicePitch.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={settings.voicePitch}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            voicePitch: parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-1 bg-[#0a0a1a] rounded-lg appearance-none cursor-pointer accent-[#e94560]"
                      />
                    </div>
                  </div>
                </div>

                {/* Auto Start */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#16213e]/50 border border-[#e94560]/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#e94560]/10">
                      <Sparkles size={18} className="text-[#e94560]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Auto Start
                      </p>
                      <p className="text-xs text-gray-400">
                        Start voice mode on launch
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        autoStart: !settings.autoStart,
                      })
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.autoStart ? "bg-[#e94560]" : "bg-[#16213e]"
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                      animate={{ x: settings.autoStart ? 26 : 2 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#e94560]/10 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#16213e] text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#e94560] to-[#c23152] text-white hover:shadow-lg hover:shadow-[#e94560]/30 transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

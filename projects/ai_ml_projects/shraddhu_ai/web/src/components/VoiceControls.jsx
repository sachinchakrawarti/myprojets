"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  X,
  Loader2,
  Waves,
  MessageSquare,
  Settings,
  History,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";

export default function VoiceControls() {
  const {
    isRecording,
    setIsRecording,
    voiceMode,
    setVoiceMode,
    sendMessage,
    isConnected,
  } = useAppContext();

  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const streamRef = useRef(null);

  // Voice conversion states
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState([]);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await sendAudioToServer(audioBlob);
        chunks.length = 0;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setAudioChunks(chunks);

      // Audio level monitoring
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);
      const updateLevel = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          requestAnimationFrame(updateLevel);
        } else {
          audioContext.close();
        }
      };
      updateLevel();

      toast.success("🎙️ Recording... Speak now!");
    } catch (error) {
      console.error("Microphone error:", error);
      toast.error("Could not access microphone. Please check permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setAudioLevel(0);
      toast.success("Recording stopped!");
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/voice/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process voice");
      }

      const data = await response.json();

      if (data.text) {
        // Save to history
        setVoiceHistory((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: data.text,
            timestamp: new Date(),
            confidence: data.confidence || 0.95,
          },
        ]);

        // Send to chat
        sendMessage(data.text);
        setTranscript(data.text);
        toast.success(`🗣️ "${data.text}"`);

        // Clear transcript after 5 seconds
        setTimeout(() => setTranscript(""), 5000);
      }
    } catch (error) {
      console.error("Audio upload error:", error);
      toast.error("Failed to process voice input");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (!isConnected) {
      toast.error("Not connected to server. Please wait...");
      return;
    }
    setIsRecording(!isRecording);
  };

  const toggleVoiceMode = () => {
    setVoiceMode(!voiceMode);
    toast.success(
      voiceMode ? "📝 Chat mode activated" : "🎤 Voice mode activated!",
    );
  };

  return (
    <>
      {/* Main Voice Controls - Floating Bottom Bar */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="glass px-4 py-2.5 rounded-full border border-[#e94560]/20 shadow-2xl shadow-[#e94560]/10 flex items-center gap-3">
          {/* Chat/Voice Mode Toggle */}
          <button
            onClick={toggleVoiceMode}
            className={`p-2 rounded-full transition-all ${
              voiceMode
                ? "bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/30"
                : "bg-[#16213e] text-gray-400 hover:text-white border border-transparent"
            }`}
            title={voiceMode ? "Switch to Chat Mode" : "Switch to Voice Mode"}
          >
            {voiceMode ? <Volume2 size={18} /> : <MessageSquare size={18} />}
          </button>

          <div className="w-px h-8 bg-[#e94560]/20"></div>

          {/* Record Button */}
          <button
            onClick={toggleRecording}
            disabled={isProcessing || !isConnected}
            className={`relative p-4 rounded-full transition-all ${
              isRecording
                ? "bg-red-500 text-white glow-pulse"
                : isProcessing
                  ? "bg-[#16213e] text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#e94560] to-[#c23152] text-white hover:shadow-lg hover:shadow-[#e94560]/30"
            }`}
          >
            {isProcessing ? (
              <Loader2 size={24} className="animate-spin" />
            ) : isRecording ? (
              <MicOff size={24} />
            ) : (
              <Mic size={24} />
            )}

            {/* Recording Ripple */}
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-30"></span>
                <span className="absolute inset-0 rounded-full animate-pulse bg-red-500 opacity-20"></span>
              </>
            )}
          </button>

          {/* Audio Level Visualizer */}
          {isRecording && (
            <div className="flex items-center gap-1 min-w-[80px]">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-[#e94560] to-pink-400 rounded-full"
                  animate={{
                    height: Math.max(4, (audioLevel * 50 * (i + 1)) / 12),
                  }}
                  transition={{ duration: 0.1 }}
                  style={{ height: 4 }}
                />
              ))}
            </div>
          )}

          {/* Transcript Display */}
          {transcript && !isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1.5 rounded-lg bg-[#e94560]/10 border border-[#e94560]/20 max-w-[200px]"
            >
              <p className="text-xs text-[#e94560] truncate">"{transcript}"</p>
            </motion.div>
          )}

          <div className="w-px h-8 bg-[#e94560]/20"></div>

          {/* Status */}
          <div className="flex items-center gap-2 min-w-[80px]">
            <div
              className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
            />
            <span className="text-xs text-gray-400">
              {isRecording
                ? "Recording..."
                : isProcessing
                  ? "Processing..."
                  : voiceMode
                    ? "Voice Mode"
                    : isConnected
                      ? "Ready"
                      : "Disconnected"}
            </span>
          </div>

          {/* History Button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="p-1.5 rounded-lg hover:bg-[#e94560]/10 transition-colors text-gray-400 hover:text-white"
            title="Voice History"
          >
            <History size={16} />
          </button>
        </div>
      </motion.div>

      {/* Voice Mode Indicator - Top Right */}
      {voiceMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="fixed top-20 right-4 glass px-4 py-2.5 rounded-xl border border-[#e94560]/20 z-20 flex items-center gap-3 shadow-lg"
        >
          <div className="p-1.5 rounded-full bg-[#e94560]/20">
            <Sparkles size={14} className="text-[#e94560]" />
          </div>
          <span className="text-sm text-gray-200 font-medium">Voice Mode</span>
          <span className="text-xs text-[#e94560] animate-pulse">● Live</span>
          <button
            onClick={toggleVoiceMode}
            className="p-0.5 rounded hover:bg-[#e94560]/20 transition-colors"
          >
            <X size={14} className="text-gray-400 hover:text-white" />
          </button>
        </motion.div>
      )}

      {/* Voice Conversion Modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowVoiceModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass w-full max-w-2xl rounded-2xl border border-[#e94560]/20 overflow-hidden max-h-[80vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#e94560]/10">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Waves size={20} className="text-[#e94560]" />
                    Voice Conversion History
                  </h2>
                  <button
                    onClick={() => setShowVoiceModal(false)}
                    className="p-1.5 rounded-lg hover:bg-[#e94560]/10 transition-colors text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  {voiceHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Mic size={48} className="mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400">No voice conversions yet</p>
                      <p className="text-sm text-gray-500">
                        Start speaking to see your voice history here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {voiceHistory.map((item) => (
                        <div
                          key={item.id}
                          className="glass p-3 rounded-xl border border-[#e94560]/10"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-sm text-white">{item.text}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    item.timestamp,
                                  ).toLocaleTimeString()}
                                </span>
                                <span className="text-xs text-green-400">
                                  {(item.confidence * 100).toFixed(0)}%
                                  confidence
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => sendMessage(item.text)}
                              className="p-1.5 rounded-lg bg-[#e94560]/10 text-[#e94560] hover:bg-[#e94560]/20 transition-colors"
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

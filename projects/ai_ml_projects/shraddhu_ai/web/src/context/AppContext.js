'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: "Hey there! I'm Shraddhu AI. How can I help you today? ✨",
      timestamp: new Date(),
    },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const wsRef = useRef(null);

  // WebSocket connection
  useEffect(() => {
    if (isConnected) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast.success('Connected to Shraddhu AI');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          if (isConnected) {
            setIsConnected(true);
          }
        }, 3000);
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [isConnected]);

  const handleWebSocketMessage = (data) => {
    if (data.type === 'message') {
      addMessage('ai', data.content);
      setIsTyping(false);
    } else if (data.type === 'typing') {
      setIsTyping(true);
    } else if (data.type === 'stop_typing') {
      setIsTyping(false);
    } else if (data.type === 'voice_response') {
      // Handle voice response
      playAudioResponse(data.audio);
    }
  };

  const playAudioResponse = (audioBase64) => {
    try {
      const audioContext = new AudioContext();
      const audioData = atob(audioBase64);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      audioContext.decodeAudioData(arrayBuffer, (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      });
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const addMessage = (type, content) => {
    const newMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendMessage = (content) => {
    if (!content.trim()) return;

    addMessage('user', content);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: content,
        voice_mode: voiceMode,
      }));
      setIsTyping(true);
    } else {
      toast.error('Not connected to server');
      // Fallback: Simulate response
      setTimeout(() => {
        addMessage('ai', "I'm here! What would you like to talk about? 💫");
      }, 1000);
    }
  };

  const value = {
    messages,
    setMessages,
    isConnected,
    setIsConnected,
    isTyping,
    setIsTyping,
    isRecording,
    setIsRecording,
    voiceMode,
    setVoiceMode,
    sendMessage,
    addMessage,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
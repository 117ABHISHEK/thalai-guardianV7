"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"

const Chatbot = () => {
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    initializeChat()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const initializeChat = async () => {
    try {
      const response = await axios.get("/api/mental-health/chat/session", {
        withCredentials: true,
      })
      setSession(response.data)
      setMessages(response.data.messages)
    } catch (error) {
      console.error("Error initializing chat:", error)
    }
  }

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim() || !session) return

    const userMessage = {
      sender: "patient",
      message: message.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setLoading(true)

    try {
      const response = await axios.post(
        "/api/mental-health/chat/message",
        {
          message: message.trim(),
          sessionId: session._id,
        },
        {
          withCredentials: true,
        },
      )

      setMessages((prev) => [...prev, response.data.botMessage])
      setSuggestions(response.data.suggestions || [])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = {
        sender: "bot",
        message:
          "I'm sorry, I'm having trouble responding right now. Please try again or consider speaking with one of our counselors.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)
    setSuggestions([])
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-96 flex flex-col">
      <div className="bg-purple-600 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">Mental Health Support Chat</h3>
        <p className="text-sm opacity-90">I'm here to listen and provide emotional support</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === "patient" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === "patient" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${message.sender === "patient" ? "text-purple-200" : "text-gray-500"}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Suggested responses:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows="1"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !inputMessage.trim()}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This is an AI assistant. For immediate help, call 988 (Suicide & Crisis Lifeline)
        </p>
      </div>
    </div>
  )
}

export default Chatbot

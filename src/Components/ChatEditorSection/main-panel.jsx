import { useState, useRef, useEffect } from "react"
import {
  Send,
  Paperclip,
  Video,
  Mic,
  Lock,
  Unlock,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Upload,
  X,
  Film,
  Reply,
  Trash2,
  Smile,
} from "lucide-react"

export default function MainPanel({ currentProject }) {
  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "system",
      content: "Project brief pinned",
      isPinned: true,
      timestamp: "10:00 AM",
      reactions: [],
    },
    {
      id: "msg-2",
      sender: "client",
      content: "Can we make the intro a bit faster?",
      timestamp: "10:15 AM",
      reactions: [],
      replyTo: null,
    },
    {
      id: "msg-3",
      sender: "you",
      content: "Sure, I'll adjust the pacing and send a new version this afternoon.",
      timestamp: "10:20 AM",
      reactions: [],
      replyTo: "msg-2",
    },
    {
      id: "msg-4",
      sender: "client",
      content: "Great! Also, can we use a different background music?",
      timestamp: "10:25 AM",
      sentiment: "neutral",
      reactions: [],
      replyTo: null,
    },
    {
      id: "msg-5",
      sender: "you",
      content: "Absolutely. I'll try a few options and include them in the next draft.",
      timestamp: "10:30 AM",
      reactions: [{ emoji: "👍", count: 1, users: ["client"] }],
      replyTo: "msg-4",
    },
    {
      id: "msg-6",
      sender: "client",
      content: "The colors look a bit washed out. Can we make them more vibrant?",
      timestamp: "11:05 AM",
      sentiment: "negative",
      reactions: [],
      replyTo: null,
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedDraft, setSelectedDraft] = useState(currentProject.drafts[1])
  const [isStreaming, setIsStreaming] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(null)

  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const fileInputRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "you",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      reactions: [],
      replyTo: replyingTo ? replyingTo.id : null,
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
    setReplyingTo(null)
  }

  const toggleDraftLock = (draftId) => {
    const updatedDrafts = currentProject.drafts.map((draft) =>
      draft.id === draftId ? { ...draft, locked: !draft.locked } : draft,
    )
    // This would update the parent state in a real app
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleReplyToMessage = (message) => {
    setReplyingTo(message)
  }

  const handleDeleteMessage = (messageId) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, content: "This message was deleted", isDeleted: true } : msg,
      ),
    )
  }

  const handleAddReaction = (messageId, emoji) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const existingReactionIndex = msg.reactions.findIndex((r) => r.emoji === emoji)

          if (existingReactionIndex > -1) {
            // If reaction already exists, update it
            const updatedReactions = [...msg.reactions]
            const reaction = updatedReactions[existingReactionIndex]

            if (reaction.users.includes("you")) {
              // Remove user from reaction
              reaction.users = reaction.users.filter((u) => u !== "you")
              reaction.count--

              // Remove reaction if no users left
              if (reaction.count === 0) {
                updatedReactions.splice(existingReactionIndex, 1)
              }
            } else {
              // Add user to reaction
              reaction.users.push("you")
              reaction.count++
            }

            return { ...msg, reactions: updatedReactions }
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [...msg.reactions, { emoji, count: 1, users: ["you"] }],
            }
          }
        }
        return msg
      }),
    )

    setShowEmojiPicker(null)
  }

  const getReplyMessage = (replyId) => {
    return messages.find((msg) => msg.id === replyId)
  }

  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "👏"]

  return (
    <div className="w-full flex flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-6 py-4 font-medium text-sm flex items-center ${
            activeTab === "chat"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat
        </button>
        <button
          className={`px-6 py-4 font-medium text-sm flex items-center ${
            activeTab === "stream"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("stream")}
        >
          <Video className="w-4 h-4 mr-2" />
          Stream
        </button>
      </div>

      {activeTab === "chat" ? (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "you" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative max-w-[80%] rounded-lg p-3 ${
                    message.isPinned
                      ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 w-full"
                      : message.sender === "you"
                        ? "bg-blue-500 dark:bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700"
                  } ${
                    message.sentiment === "negative" ? "border-l-4 border-yellow-500" : ""
                  } group hover:shadow-sm transition-shadow`}
                >
                  {/* Reply indicator */}
                  {message.replyTo && (
                    <div
                      className={`text-xs mb-1 pb-1 border-b ${
                        message.sender === "you"
                          ? "border-blue-400 dark:border-blue-500 text-blue-100"
                          : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                      } flex items-center`}
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      <span className="truncate">
                        {getReplyMessage(message.replyTo)?.isDeleted
                          ? "Replied to a deleted message"
                          : `Replied to: ${getReplyMessage(message.replyTo)?.content.substring(0, 30)}${getReplyMessage(message.replyTo)?.content.length > 30 ? "..." : ""}`}
                      </span>
                    </div>
                  )}

                  {message.isPinned && (
                    <div className="text-xs text-blue-500 dark:text-blue-400 mb-1 font-semibold">
                      PINNED PROJECT BRIEF
                    </div>
                  )}

                  <p className={`text-sm ${message.isDeleted ? "italic text-gray-400 dark:text-gray-500" : ""}`}>
                    {message.content}
                  </p>

                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{message.timestamp}</span>
                    {message.sentiment === "negative" && (
                      <div className="text-xs text-yellow-500 dark:text-yellow-400 flex items-center">
                        <span className="mr-1">Suggestion available</span>
                        <div className="group relative">
                          <button className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-300">
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-white dark:bg-gray-800 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">Suggested response:</p>
                            <p className="text-xs text-gray-800 dark:text-white">
                              "I'll enhance the color grading to make the visuals more vibrant. You'll see the
                              difference in v1.2 tomorrow."
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message reactions */}
                  {message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {message.reactions.map((reaction, index) => (
                        <button
                          key={index}
                          onClick={() => handleAddReaction(message.id, reaction.emoji)}
                          className={`text-xs rounded-full px-1.5 py-0.5 ${
                            reaction.users.includes("you")
                              ? "bg-blue-100 dark:bg-blue-800/50"
                              : "bg-gray-100 dark:bg-gray-800/50"
                          }`}
                        >
                          <span>
                            {reaction.emoji} {reaction.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    {/* Reply button */}
                    <button
                      onClick={() => handleReplyToMessage(message)}
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      <Reply className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                    </button>

                    {/* Reaction button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                        className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        <Smile className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                      </button>

                      {/* Emoji picker */}
                      {showEmojiPicker === message.id && (
                        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-10 flex space-x-1">
                          {commonEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleAddReaction(message.id, emoji)}
                              className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete button (only for your messages) */}
                    {message.sender === "you" && !message.isDeleted && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Draft Viewer (Toggled) */}
          {showDrafts && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 relative">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Project Drafts</h3>
                <button
                  onClick={() => setShowDrafts(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-2 mb-3">
                {currentProject.drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className={`relative cursor-pointer group ${
                      selectedDraft.id === draft.id ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedDraft(draft)}
                  >
                    <img
                      src={draft.thumbnail || "/placeholder.svg"}
                      alt={`Draft ${draft.version}`}
                      className="h-16 w-28 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDraftLock(draft.id)
                        }}
                      >
                        {draft.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="absolute bottom-1 right-1 text-xs bg-black/70 px-1 rounded">{draft.version}</span>
                  </div>
                ))}
                <div
                  className="h-16 w-28 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={handleFileUpload}
                >
                  <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input type="file" ref={fileInputRef} className="hidden" accept="video/*" />
                </div>
              </div>

              {selectedDraft && (
                <div className="bg-black rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Video player would appear here</p>
                      <p className="text-xs text-gray-600 mt-1">Draft {selectedDraft.version}</p>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-2 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button className="p-1 rounded hover:bg-gray-700">
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-700">
                        <ThumbsDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">
                      {selectedDraft.locked ? "Locked for client" : "Visible to client"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reply indicator */}
          {replyingTo && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Reply className="w-4 h-4 mr-2 text-blue-500" />
                <span className="truncate">
                  Replying to: {replyingTo.content.substring(0, 50)}
                  {replyingTo.content.length > 50 ? "..." : ""}
                </span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleFileUpload}
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowDrafts(true)}
              >
                <Film className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors"
                disabled={!newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col">
          {isStreaming ? (
            <div className="flex-1 bg-black relative">
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-gray-800/80 rounded-full">
                  <Mic className="w-5 h-5 text-white" />
                </button>
                <button className="p-2 bg-red-600/80 rounded-full" onClick={() => setIsStreaming(false)}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </div>
                </button>
              </div>
              <div className="absolute bottom-4 left-4 bg-gray-900/80 px-3 py-1 rounded-full flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs font-medium">LIVE</span>
              </div>
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Live stream preview would appear here</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="text-center p-8 max-w-md">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Start a Collaboration Stream</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Share your screen or camera feed in real-time with your client to discuss project details.
                </p>
                <button
                  className="px-6 py-3 bg-blue-500 dark:bg-blue-600 hover:bg-blue-400 dark:hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center mx-auto"
                  onClick={() => setIsStreaming(true)}
                >
                  <Video className="w-5 h-5 mr-2" />
                  Start Streaming
                </button>
              </div>
            </div>
          )}

          {isStreaming && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Live Feedback</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">No feedback yet. Client feedback will appear here during the stream.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


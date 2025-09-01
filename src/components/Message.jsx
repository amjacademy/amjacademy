"use client"

import { useState } from "react"
import "./message.css"

const Message = () => {
  const [selectedContact, setSelectedContact] = useState("anto-maria")
  const [messageText, setMessageText] = useState("")
  const [searchText, setSearchText] = useState("")

  const contacts = [
    {
      id: "sia-tai",
      name: "Sia Tai",
      lastMessage: "yes my dear",
      time: "4 days ago",
      avatar: "/placeholder.svg?height=50&width=50",
      online: false,
    },
    {
      id: "deveshwar-san",
      name: "Deveshwar San",
      lastMessage: "ok",
      time: "7 days ago",
      avatar: "/placeholder.svg?height=50&width=50",
      online: false,
    },
    {
      id: "nitika-sin",
      name: "Nitika Sin",
      lastMessage: "No Communication Available",
      time: "",
      avatar: "/placeholder.svg?height=50&width=50",
      online: true,
    },
    {
      id: "maahi-dan",
      name: "MAAHI DAN",
      lastMessage: "No Communication Available",
      time: "",
      avatar: "/placeholder.svg?height=50&width=50",
      online: false,
    },
    {
      id: "akshita-jay",
      name: "Akshita Jay",
      lastMessage: "No Communication Available",
      time: "",
      avatar: "/placeholder.svg?height=50&width=50",
      online: false,
    },
    {
      id: "sauravi",
      name: "Sauravi",
      lastMessage: "No Communication Available",
      time: "",
      avatar: "/placeholder.svg?height=50&width=50",
      online: false,
    },
  ]

  const currentContact = contacts.find((contact) => contact.id === selectedContact) || contacts[0]

  const messages = [
    {
      id: 1,
      sender: "anto-maria",
      text: "Hello! How are you doing with your keyboard practice?",
      time: "10:30 AM",
      isOwn: false,
    },
    {
      id: 2,
      sender: "me",
      text: "Hi! I'm doing great. I've been practicing the scales you taught me.",
      time: "10:32 AM",
      isOwn: true,
    },
    {
      id: 3,
      sender: "anto-maria",
      text: "That's wonderful to hear! Keep up the good work.",
      time: "10:35 AM",
      isOwn: false,
    },
  ]

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchText.toLowerCase()))

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", messageText)
      setMessageText("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="message-container">
      <div className="message-header">
        <h1>Message</h1>
      </div>

      <div className="message-content">
        <div className="message-layout">
          {/* Contacts List */}
          <div className="contacts-panel">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="contacts-list">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`contact-item ${selectedContact === contact.id ? "active" : ""}`}
                  onClick={() => setSelectedContact(contact.id)}
                >
                  <div className="contact-avatar">
                    <img src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                    {contact.online && <div className="online-indicator"></div>}
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-last-message">{contact.lastMessage}</div>
                  </div>
                  {contact.time && <div className="contact-time">{contact.time}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-panel">
            <div className="chat-header">
              <div className="chat-contact-info">
                <img
                  src={currentContact.avatar || "/placeholder.svg"}
                  alt={currentContact.name}
                  className="chat-avatar"
                />
                <span className="chat-contact-name">{currentContact.name}</span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.isOwn ? "own" : "other"}`}>
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">{message.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="chat-input"
                />
                <button onClick={handleSendMessage} className="send-button" disabled={!messageText.trim()}>
                  <span className="send-icon">➤</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Message

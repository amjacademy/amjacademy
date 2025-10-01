import { useState, useEffect } from "react"
import "./Message.css"

const Message = () => {
  const [selectedContact, setSelectedContact] = useState("")
  const [messageText, setMessageText] = useState("")
  const [currentUser, setCurrentUser] = useState("")
  const [isScreenshotAttempt, setIsScreenshotAttempt] = useState(false)
  const [announcements, setAnnouncements] = useState([])

  // Get username from localStorage on component mount
  useEffect(() => {
    const username = localStorage.getItem('username') || 'Student'
    setCurrentUser(username)
    // Set default selected contact to first teacher
    if (!selectedContact) {
      setSelectedContact("ms-lisa")
    }
  }, [selectedContact])

  // Load announcements from localStorage and filter for Students or All
  useEffect(() => {
    const storedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]')
    const filtered = storedAnnouncements.filter(a => a.receiver === "Students" || a.receiver === "All")
    setAnnouncements(filtered)
  }, [])

  // Detect screenshot attempt
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 44) { // Print Screen key
        setIsScreenshotAttempt(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const contacts = [
    {
      id: "ms-lisa",
      name: "Ms. Lisa",
      lastMessage: "yes my dear",
      time: "4 days ago",
      avatar: "/placeholder.svg?height=50&width=50",
      online: false,
    },
    {
      id: "mr-david",
      name: "Mr. David",
      lastMessage: "ok",
      time: "7 days ago",
      avatar: "/placeholder.svg?height=50&width=50",
      online: false,
    },
    {
      id: "ms-sarah",
      name: "Ms. Sarah",
      lastMessage: "No Communication Available",
      time: "",
      avatar: "/placeholder.svg?height=50&width=50",
      online: true,
    },
    {
      id: "mr-john",
      name: "Mr. John",
      lastMessage: "No Communication Available",
      time: "",
      avatar: "/placeholder.svg?height=50&width=50",
      online: false,
    },
    {
      id: "ms-anna",
      name: "Ms. Anna",
      lastMessage: "No Communication Available",
      time: "",
      avatar: "/placeholder.svg?height=50&width=50",
      online: false,
    },
    {
      id: "mr-mike",
      name: "Mr. Mike",
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
      sender: currentUser || "Student",
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
      sender: currentUser || "Student",
      text: "That's wonderful to hear! Keep up the good work.",
      time: "10:35 AM",
      isOwn: false,
    },
  ]

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

      <div className="content-header2">
        <h1>MESSAGE</h1>
        <div className="user-info">
          <span>Logged in as: {currentUser}</span>
        </div>
      </div>

      <div className="message-content">
        <div className="message-layout">
          {/* Contacts List */}
          <div className="contacts-panel">
            <div className="contacts-header">
              <h3>Student: {currentUser}</h3>
            </div>
            <div className="search-container">
              <select
                value={selectedContact}
                onChange={(e) => setSelectedContact(e.target.value)}
                className="search-input"
              >
                <option value="">Select a teacher to message</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="contacts-list">
              {contacts.map((contact) => (
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
                    <div className="contact-name">{isScreenshotAttempt ? '███' : contact.name}</div>
                    <div className="contact-last-message">{isScreenshotAttempt ? '███' : contact.lastMessage}</div>
                  </div>
                  {contact.time && <div className="contact-time">{isScreenshotAttempt ? '███' : contact.time}</div>}
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
                  alt={currentUser}
                  className="chat-avatar"
                />
                <span className="chat-contact-name">{isScreenshotAttempt ? '███' : currentUser}</span>
              </div>
            </div>

            <div className="chat-messages" onContextMenu={(e) => e.preventDefault()}>
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.isOwn ? "own" : "other"}`}>
                  <div className="message-content" onContextMenu={(e) => e.preventDefault()} style={isScreenshotAttempt ? {backgroundColor: 'black'} : {}}>
                    <div className="message-text">{isScreenshotAttempt ? '███' : message.text}</div>
                    <div className="message-time">{isScreenshotAttempt ? '███' : message.time}</div>
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

import { useState, useEffect } from "react"
import "./Message.css"

const Message = () => {
  const [selectedContact, setSelectedContact] = useState("")
  const [messageText, setMessageText] = useState("")
  const [currentUser, setCurrentUser] = useState("")
  const [isScreenshotAttempt, setIsScreenshotAttempt] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [assignedTeachers, setAssignedTeachers] = useState([])
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState('')
  const [modalType, setModalType] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Ms. Lisa",
      text: "Hello! How are you doing with your keyboard practice?",
      time: "10:30 AM",
      isOwn: false,
      status: "read", // read, delivered, sent
    },
    {
      id: 2,
      sender: "me",
      text: "Hi! I'm doing great. I've been practicing the scales you taught me.",
      time: "10:32 AM",
      isOwn: true,
      status: "read",
    },
    {
      id: 3,
      sender: "Ms. Lisa",
      text: "That's wonderful to hear! Keep up the good work.",
      time: "10:35 AM",
      isOwn: false,
      status: "delivered",
    },
  ])

  // Get username from localStorage on component mount
  useEffect(() => {
    const username = localStorage.getItem('username') || 'Student'
    setCurrentUser(username)
    // Load assigned teachers for this student
    const storedTeachers = JSON.parse(localStorage.getItem('assignedTeachers') || '[]')
    const studentTeachers = storedTeachers.filter(assignment => assignment.student === username)
    // If no assigned teachers, use dummy data for testing
    const teachers = studentTeachers.length > 0 ? studentTeachers.map(assignment => assignment.teacher) : ['Ms. Lisa', 'Mr. David']
    setAssignedTeachers(teachers)
    // Set default selected contact to first teacher
    if (!selectedContact) {
      setSelectedContact(teachers[0].toLowerCase().replace(' ', '-'))
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

  // Close upload options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUploadOptions && !event.target.closest('.upload-options') && !event.target.closest('.pin-button')) {
        setShowUploadOptions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUploadOptions])

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

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "me",
        text: messageText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        status: "sent"
      }
      setMessages(prev => [...prev, newMessage])
      setMessageText("")

      // Simulate message delivery and read status
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        ))
      }, 1000)

      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: "read" } : msg
        ))
      }, 2000)
    }
  }

  const generateVideoThumbnail = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      video.preload = 'metadata'
      video.src = URL.createObjectURL(file)
      video.currentTime = 1 // Seek to 1 second

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
        URL.revokeObjectURL(video.src)
        resolve(thumbnailUrl)
      }

      video.onerror = () => {
        resolve(null) // Fallback if thumbnail generation fails
      }
    })
  }

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0]
    if (file) {
      let icon = "📎"
      if (type === "image") icon = "🖼️"
      else if (type === "video") icon = "🎥"
      else if (type === "document") icon = "📄"

      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
      const fileUrl = URL.createObjectURL(file)

      let thumbnailUrl = null
      if (type === "video") {
        thumbnailUrl = await generateVideoThumbnail(file)
      }

      const newMessage = {
        id: messages.length + 1,
        sender: "me",
        text: `${icon} ${typeLabel}: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        status: "sent",
        isFile: true,
        fileType: type,
        fileUrl: fileUrl,
        thumbnailUrl: thumbnailUrl,
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      }
      setMessages(prev => [...prev, newMessage])

      // Simulate delivery and read
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        ))
      }, 1000)

      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: "read" } : msg
        ))
      }, 2000)
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
                {contacts.filter((contact) => assignedTeachers.includes(contact.name)).map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="contacts-list">
              {contacts.filter((contact) => assignedTeachers.includes(contact.name)).map((contact) => (
                <div
                  key={contact.id}
                  className={`contact-item ${selectedContact === contact.id ? "active" : ""}`}
                  onClick={() => setSelectedContact(contact.id)}
                >
                  <div className="contact-avatar">
                    <img src="anto-logo.jpg" alt={contact.name} />
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
                  src="anto-logo.jpg"
                  alt={currentContact.name}
                  className="chat-avatar"
                />
                <span className="chat-contact-name">{isScreenshotAttempt ? '███' : currentContact.name}</span>
              </div>
            </div>

            <div className="chat-messages" onContextMenu={(e) => e.preventDefault()}>
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.isOwn ? "own" : "other"}`}>
                  <div className="message-content" onContextMenu={(e) => e.preventDefault()} style={isScreenshotAttempt ? {backgroundColor: 'black'} : {}}>
                    {message.isFile && message.fileType === 'image' && message.fileUrl ? (
                      <div className="file-message">
                        {isScreenshotAttempt ? (
                          <div className="screenshot-blocked">
                            <div className="blocked-content">███</div>
                          </div>
                        ) : (
                          <img
                            src={message.fileUrl}
                            alt={message.text}
                            className="uploaded-image clickable"
                            onClick={() => {
                              setModalContent(message.fileUrl)
                              setModalType('image')
                              setShowModal(true)
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        )}
                        <div className="message-text">{isScreenshotAttempt ? '███' : message.text}</div>
                      </div>
                    ) : message.isFile && message.fileType === 'video' && message.fileUrl ? (
                      <div className="file-message">
                        {isScreenshotAttempt ? (
                          <div className="screenshot-blocked">
                            <div className="blocked-content">███</div>
                          </div>
                        ) : (
                          message.thumbnailUrl ? (
                            <div className="video-thumbnail-container">
                              <img
                                src={message.thumbnailUrl}
                                alt="Video thumbnail"
                                className="video-thumbnail clickable"
                                onClick={() => {
                                  setModalContent(message.fileUrl)
                                  setModalType('video')
                                  setShowModal(true)
                                }}
                                onContextMenu={(e) => e.preventDefault()}
                              />
                              <div className="play-overlay">▶</div>
                            </div>
                          ) : (
                            <video
                              controls
                              className="uploaded-video clickable"
                              onClick={() => {
                                setModalContent(message.fileUrl)
                                setModalType('video')
                                setShowModal(true)
                              }}
                              onContextMenu={(e) => e.preventDefault()}
                            >
                              <source src={message.fileUrl} type={message.fileType} />
                              Your browser does not support the video tag.
                            </video>
                          )
                        )}
                        <div className="message-text">{isScreenshotAttempt ? '███' : message.text}</div>
                      </div>
                    ) : message.isFile && message.fileType === 'document' && message.fileUrl ? (
                      <div className="file-message">
                        <div
                          className="document-preview clickable"
                          onClick={() => {
                            setModalContent(message.fileUrl)
                            setModalType('document')
                            setShowModal(true)
                          }}
                        >
                          <div className="document-icon">📄</div>
                          <div className="document-info">
                            <div className="document-name">{isScreenshotAttempt ? '███' : message.fileName || 'Document'}</div>
                            <div className="document-size">{isScreenshotAttempt ? '███' : message.fileSize || ''}</div>
                          </div>
                          <button
                            className="document-download-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              const link = document.createElement('a')
                              link.href = message.fileUrl
                              link.download = message.fileName || 'document'
                              link.click()
                            }}
                            title="Download document"
                          >
                            ⬇️
                          </button>
                        </div>
                        <div className="message-text">{isScreenshotAttempt ? '███' : message.text}</div>
                      </div>
                    ) : (
                      <div className="message-text">{isScreenshotAttempt ? '███' : message.text}</div>
                    )}
                    <div className="message-meta">
                      <div className="message-time">{isScreenshotAttempt ? '███' : message.time}</div>
                      {message.isOwn && (
                        <div className="message-status">
                          {message.status === "sent" && <span className="tick single">✓</span>}
                          {message.status === "delivered" && <span className="tick double">✓✓</span>}
                          {message.status === "read" && <span className="tick double blue">✓✓</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-container">
              <div className="chat-input-wrapper" style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="chat-input"
                />

                {/* Hidden file inputs for different types */}
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, 'image')}
                />
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, 'video')}
                />
                <input
                  type="file"
                  id="document-upload"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e, 'document')}
                />

                {/* Upload options dropdown */}
                {showUploadOptions && (
                  <div className="upload-options" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="upload-option"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowUploadOptions(false)
                        document.getElementById('image-upload').click()
                      }}
                    >
                      🖼️ Image
                    </button>
                    <button
                      className="upload-option"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowUploadOptions(false)
                        document.getElementById('video-upload').click()
                      }}
                    >
                      🎥 Video
                    </button>
                    <button
                      className="upload-option"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowUploadOptions(false)
                        document.getElementById('document-upload').click()
                      }}
                    >
                      📄 Document
                    </button>
                  </div>
                )}

                <button
                  className="pin-button"
                  onClick={() => setShowUploadOptions(!showUploadOptions)}
                  title="Attach file"
                >
                  📎
                </button>
                <button onClick={handleSendMessage} className="send-button" disabled={!messageText.trim()}>
                  <span className="send-icon">➤</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for viewing images, videos, and documents */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            {modalType === 'image' ? (
              <img src={modalContent} alt="Full size" className="modal-image" onContextMenu={(e) => e.preventDefault()} />
            ) : modalType === 'video' ? (
              <video controls className="modal-video" autoPlay onContextMenu={(e) => e.preventDefault()}>
                <source src={modalContent} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : modalType === 'document' ? (
              <div className="modal-document">
                <div className="document-view-header">
                  <h3>Document Preview</h3>
                  <p>This document cannot be previewed in the browser.</p>
                </div>
                <div className="document-actions">
                  <button
                    className="download-btn"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = modalContent
                      link.download = 'document'
                      link.click()
                    }}
                  >
                    📥 Download Document
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default Message

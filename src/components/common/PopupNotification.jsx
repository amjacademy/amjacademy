import React, { useEffect, useState } from 'react';
import './PopupNotification.css';

const PopupNotification = ({ message, type, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className={`popup-notification ${type} ${isVisible ? 'show' : ''}`}>
      <div className="popup-content">
        <span className="popup-message">{message}</span>
        <button className="popup-close" onClick={() => setIsVisible(false)}>
          ×
        </button>
      </div>
    </div>
  );
};

export default PopupNotification;

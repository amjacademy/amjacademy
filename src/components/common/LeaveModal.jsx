import { useState } from 'react';
import './LeaveModal.css';

const LeaveModal = ({ isOpen, onClose, onSubmit, classData }) => {
  const [reason, setReason] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [additionalClass, setAdditionalClass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || !termsAccepted || !additionalClass.trim()) {
      alert('Please fill all fields and accept terms');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        reason: reason.trim(),
        termsAccepted,
        additionalClass: additionalClass.trim(),
        classId: classData.id,
        date: classData.time, // assuming time is date string
        time: classData.time,
      });
      onClose();
      setReason('');
      setTermsAccepted(false);
      setAdditionalClass('');
    } catch (error) {
      alert('Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="leave-modal-overlay">
      <div className="leave-modal">
        <h2>Leave Request</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reason for Leave:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for your leave..."
              required
            />
          </div>

          <div className="form-group">
            <label>Additional Class for Student:</label>
            <input
              type="text"
              value={additionalClass}
              onChange={(e) => setAdditionalClass(e.target.value)}
              placeholder="e.g., Next available slot or specific date/time"
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
            />
            <label htmlFor="terms">I accept the terms and conditions</label>
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveModal;

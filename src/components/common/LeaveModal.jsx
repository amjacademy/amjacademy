import { useState } from 'react';
import './LeaveModal.css';
import LeaveRequest from './LeaveRequest';

const LeaveModal = ({ isOpen, onClose, onSubmit, classData }) => {
  const [reason, setReason] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [additionalClass, setAdditionalClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAcceptedEnabled, setTermsAcceptedEnabled] = useState(false);

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
      alert(`Leave request sent successfully!\nReason: ${reason.trim()}`);
      onClose();
      setReason('');
      setTermsAccepted(false);
      setAdditionalClass('');
      setTermsAcceptedEnabled(false);
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

          {/* <div className="form-group">
            <label>Additional Class for Student:</label>
            <input
              type="text"
              value={additionalClass}
              onChange={(e) => setAdditionalClass(e.target.value)}
              placeholder="e.g., Next available slot or specific date/time"
              required
            />
          </div> */}

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              disabled={!termsAcceptedEnabled}
              required
            />
            <label htmlFor="terms" style={{ cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>
              I accept the <span style={{ fontWeight: 'bold', textDecoration: 'underline', color: '#007bff' }}>terms and conditions</span>
            </label>
          </div>
        </form>

        <div className="modal-buttons">
          <button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {showTerms && (
          <div className="terms-modal">
            <div className="terms-modal-content">
              <button className="close-terms-btn" onClick={() => setShowTerms(false)}>Close Terms</button>
              <LeaveRequest onAccept={() => setTermsAcceptedEnabled(true)} onClose={() => setShowTerms(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveModal;

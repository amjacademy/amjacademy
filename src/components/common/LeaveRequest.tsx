import React from "react";
import "./LeaveRequest.css";

interface LeaveRequestProps {
  onAccept: () => void;
  onClose: () => void;
}

const LeaveRequest: React.FC<LeaveRequestProps> = ({ onAccept, onClose }) => {
  const handleAccept = () => {
    onAccept();
    onClose();
  };

  return (
    <div className="leave-container">
      <div className="leave-box">
        <h2>Terms & Conditions</h2>

        <div className="terms-box">
          <h4>Terms & Conditions</h4>
          <ul>
            <li>Class cancellation may affect your overall performance and attendance.</li>
            <li>Any extra or replacement classes scheduled must be attended without fail.</li>
            <li>If the class schedule is not updated or mail notification not received, kindly confirm with the coordinator.</li>
            <li>Leave will be approved only after proper justification and faculty approval.</li>
            <li>Repeated leaves without valid reason may impact your internal marks.</li>
          </ul>
        </div>

        <div className="buttons">
          <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="accept-btn" onClick={handleAccept}>Accept</button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequest;

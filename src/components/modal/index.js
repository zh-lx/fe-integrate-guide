import React from 'react';
import './index.css';

export default function Modal(props) {
  const { visible, onConfirm, onCancel, content } = props;
  return (
    <div
      className="modal-container"
      style={{ visibility: `${visible ? 'visible' : 'hidden'}` }}
    >
      <div className="modal">
        <div className="modal-content">{content}</div>
        <div className="btn-line">
          <div className="cancel-btn" onClick={onCancel}>
            cancel
          </div>
          <div className="confirm-btn" onClick={onConfirm}>
            go
          </div>
        </div>
      </div>
    </div>
  );
}

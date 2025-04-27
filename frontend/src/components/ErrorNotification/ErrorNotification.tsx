import React from 'react';
import styles from './ErrorNotification.module.scss';

interface ErrorNotificationProps {
  message: string;
  onClose?: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, onClose }) => {
  return (
    <div className={styles.error}>
      <span className={styles.message}>{message}</span>
      {onClose && (
        <button onClick={onClose} className={styles.closeButton}>
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorNotification; 
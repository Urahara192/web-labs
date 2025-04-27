import React from 'react';
import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#007bff',
}) => {
  return (
    <div
      className={`${styles.spinner} ${styles[size]}`}
      style={{ borderTopColor: color }}
    />
  );
};

export default LoadingSpinner; 
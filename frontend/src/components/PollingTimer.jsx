import { useEffect, useState } from 'react';

export default function PollingTimer({ onTimeout, interval = 300, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(interval);

  // Reset timer when resetKey changes
  useEffect(() => {
    setTimeLeft(interval);
  }, [resetKey, interval]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (onTimeout) onTimeout();
          return interval; 
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout, interval]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="polling-timer">
      <span className="polling-icon">🔄</span>
      <span className="polling-text">Next update in: <strong>{formattedTime}</strong></span>
    </div>
  );
}

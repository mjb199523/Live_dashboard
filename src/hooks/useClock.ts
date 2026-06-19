/** Live IST clock hook */

import { useState, useEffect } from 'react';

export function useClock(): string {
  const [time, setTime] = useState(() => formatIst());

  useEffect(() => {
    const interval = setInterval(() => setTime(formatIst()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function formatIst(): string {
  const now = new Date();
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };

  const timeStr = now.toLocaleTimeString('en-US', options);
  const dateParts = now.toLocaleDateString('en-US', dateOptions).split(' ');
  // e.g. "Jun 19, 2026"
  const mo = dateParts[0].toUpperCase();
  const d = dateParts[1].replace(',', '').padStart(2, '0');
  const y = dateParts[2];

  return `${timeStr} IST · ${d} ${mo} ${y}`;
}

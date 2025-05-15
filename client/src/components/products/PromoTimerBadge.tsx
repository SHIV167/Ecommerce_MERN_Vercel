import { useEffect, useState } from "react";

interface PromoTimerBadgeProps {
  endTime: string;
}

function getTimeLeft(endTime: string) {
  const total = new Date(endTime).getTime() - Date.now();
  if (total <= 0) return null;
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)));
  return { hours, minutes, seconds };
}

export default function PromoTimerBadge({ endTime }: PromoTimerBadgeProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endTime));

  useEffect(() => {
    if (!timeLeft) return;
    const interval = setInterval(() => {
      const left = getTimeLeft(endTime);
      setTimeLeft(left);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!timeLeft) return null;

  return (
    <div className="absolute top-2 left-2 z-30 bg-[#8b5cf6] text-white text-xs px-3 py-1 rounded shadow flex items-center gap-1 border-2 border-[#a78bfa] font-semibold" style={{letterSpacing:1}}>
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" className="mr-1"><path d="M12 8v4l3 1"/><circle cx="12" cy="12" r="9"/></svg>
      {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  );
}

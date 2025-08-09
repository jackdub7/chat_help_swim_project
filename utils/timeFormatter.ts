export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
  } else {
    return remainingSeconds.toFixed(2);
  }
};

export const parseTimeToStandardFormat = (timeInput: string): string => {
  // Remove any extra whitespace
  const cleanInput = timeInput.trim();
  
  // Check if input contains a colon (minutes:seconds format)
  if (cleanInput.includes(':')) {
    const [minutesPart, secondsPart] = cleanInput.split(':');
    const minutes = parseInt(minutesPart) || 0;
    const seconds = parseFloat(secondsPart) || 0;
    
    // Format to mm:ss.ss
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toFixed(2).padStart(5, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
  } else {
    // Only seconds format (e.g., "24.5" or "24")
    const seconds = parseFloat(cleanInput) || 0;
    
    // Format to mm:ss.ss (with 00 minutes)
    const formattedSeconds = seconds.toFixed(2).padStart(5, '0');
    
    return `00:${formattedSeconds}`;
  }
};

export const parseTime = (timeString: string): number => {
  const parts = timeString.split(':');
  
  if (parts.length === 2) {
    // Format: mm:ss.ss
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  } else {
    // Format: ss.ss
    return parseFloat(timeString);
  }
};

export const validateTimeInput = (timeInput: string): boolean => {
  // Remove whitespace
  const cleanInput = timeInput.trim();
  
  // Allow empty input
  if (!cleanInput) return false;
  
  // Check for valid time formats
  // Formats: "mm:ss.ss", "m:ss.s", "ss.ss", "ss", etc.
  const timeRegex = /^(\d{1,2}:)?\d{1,2}(\.\d{1,2})?$/;
  
  return timeRegex.test(cleanInput);
};

export const calculateImprovement = (currentTime: string, previousTime: string): number => {
  const current = parseTime(currentTime);
  const previous = parseTime(previousTime);
  return previous - current; // Negative means improvement (faster)
};

export const isPersonalBest = (currentTime: string, bestTime?: string): boolean => {
  if (!bestTime) return true;
  return parseTime(currentTime) < parseTime(bestTime);
};
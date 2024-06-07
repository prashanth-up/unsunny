export const convertMinutesToDhms = (totalMinutes) => {
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.floor((totalMinutes % 1) * 60);
  
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };
  
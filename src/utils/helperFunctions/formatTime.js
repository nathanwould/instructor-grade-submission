export const formatTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours < 12 || hours === 24 ? "am" : "pm";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${minutes}${period}`
}
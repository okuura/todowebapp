/**
 * Formats a date string to YYYY/MM/DD format
 */
export const formatDate = (dateStr: string): string => {
  // Handle MMDD format (4 digits)
  if (/^\d{4}$/.test(dateStr)) {
    const currentYear = new Date().getFullYear();
    const month = dateStr.substring(0, 2);
    const day = dateStr.substring(2, 4);
    return `${currentYear}/${month}/${day}`;
  }

  // Handle YYYYMMDD format
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`;
  }

  // If already in YYYY/MM/DD format, return as is
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try to parse the date and format it
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}/${month}/${day}`;
  } catch (e) {
    return '';
  }
};

/**
 * Checks if a date is valid
 */
export const isValidDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  
  // Format the date if needed
  const formattedDate = formatDate(dateStr);
  if (!formattedDate) return false;
  
  // Check if the formatted date is valid
  const [year, month, day] = formattedDate.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/**
 * Gets the days in a month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Gets the current month's calendar data
 */
export const getCalendarData = (year: number, month: number) => {
  // Month is 1-based here (January is 1, December is 12)
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sunday, 6 = Saturday
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  
  const days = [];
  
  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    const prevMonth = month - 1 <= 0 ? 12 : month - 1;
    const prevYear = month - 1 <= 0 ? year - 1 : year;
    const day = daysInPrevMonth - i;
    
    days.push({
      date: `${prevYear}/${String(prevMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
      day,
      currentMonth: false
    });
  }
  
  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: `${year}/${String(month).padStart(2, '0')}/${String(i).padStart(2, '0')}`,
      day: i,
      currentMonth: true
    });
  }
  
  // Next month's days
  const remainingDays = 42 - days.length; // 6 rows of 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const nextMonth = month + 1 > 12 ? 1 : month + 1;
    const nextYear = month + 1 > 12 ? year + 1 : year;
    
    days.push({
      date: `${nextYear}/${String(nextMonth).padStart(2, '0')}/${String(i).padStart(2, '0')}`,
      day: i,
      currentMonth: false
    });
  }
  
  return days;
};

/**
 * Gets the current date in YYYY/MM/DD format
 */
export const getCurrentDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}/${month}/${day}`;
};
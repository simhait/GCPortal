import React from 'react';
import { Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { useStore } from '../store/useStore';

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'very-early-morning';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 20) return 'evening';
  return 'night';
};

const TimeOfDayIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
  const darkMode = useStore((state) => state.darkMode);
  const timeOfDay = getTimeOfDay();

  switch (timeOfDay) {
    case 'very-early-morning':
      return <Moon className={`${className} text-indigo-400`} />;
    case 'morning':
      return <Sunrise className={`${className} text-amber-500`} />;
    case 'afternoon':
      return <Sun className={`${className} text-amber-500`} />;
    case 'evening':
      return <Sunset className={`${className} text-indigo-400`} />;
    case 'night':
      return <Moon className={`${className} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />;
  }
};

export const getTimeBasedGreeting = (name?: string) => {
  const timeOfDay = getTimeOfDay();
  let greeting = '';
  
  switch (timeOfDay) {
    case 'very-early-morning':
      greeting = 'Good very early morning';
      break;
    case 'morning':
      greeting = 'Good morning';
      break;
    case 'afternoon':
      greeting = 'Good afternoon';
      break;
    case 'evening':
      greeting = 'Good evening';
      break;
    case 'night':
      greeting = 'Good night';
      break;
  }

  return `${greeting}${name ? `, ${name}` : ''}`;
};

const getTimeBasedBackground = () => {
  return 'bg-gray-50';
};
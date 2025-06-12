import React from 'react';
import { useStore } from '../store/useStore';

interface LogoProps {
  className?: string;
  size?: 'default' | 'large';
}

export const Logo = ({ className = "h-8", size = 'default' }: LogoProps) => {
  const darkMode = useStore((state) => state.darkMode);

  return (
    <div className="flex items-center">
      <svg 
        className={className}
        viewBox="0 0 400 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background rectangle shape */}
        <rect 
          x="25" 
          y="25" 
          width="50" 
          height="50" 
          rx="8" 
          fill={darkMode ? '#7C3AED' : '#6366F1'}
          opacity="0.2"
        />
        
        {/* Front rectangle shape */}
        <rect 
          x="37" 
          y="37" 
          width="50" 
          height="50" 
          rx="8" 
          fill={darkMode ? '#7C3AED' : '#6366F1'}
        />
        
        {/* Text */}
        <text 
          x="110" 
          y="75" 
          fontFamily="Arial, sans-serif" 
          fontSize={size === 'large' ? '48' : '42'} 
          fontWeight="bold" 
          fill={darkMode ? '#FFFFFF' : '#111827'}
        >
          Workspace
        </text>
      </svg>
    </div>
  );
};
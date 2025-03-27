import { useState, useEffect } from 'react';

interface FooterProps {
  lastUpdateTime: string;
}

export function Footer({ lastUpdateTime }: FooterProps) {
  return (
    <footer className="bg-white dark:bg-[#1E1E1E] shadow-md mt-auto transition-colors duration-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Hand Motion Tracking Interface</p>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
            Last update: {lastUpdateTime || 'Never'}
          </span>
          <a 
            href="https://github.com/google/mediapipe/blob/master/docs/solutions/hands.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#2196F3] hover:text-blue-700 text-sm"
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}

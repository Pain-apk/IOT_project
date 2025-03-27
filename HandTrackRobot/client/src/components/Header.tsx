import { useState, useEffect } from 'react';

interface HeaderProps {
  isConnected: boolean;
  onToggleDarkMode: () => void;
  darkMode: boolean;
}

export function Header({ isConnected, onToggleDarkMode, darkMode }: HeaderProps) {
  const [statusMessage, setStatusMessage] = useState('Connected');

  useEffect(() => {
    setStatusMessage(isConnected ? 'Connected' : 'Disconnected');
  }, [isConnected]);

  return (
    <header className="bg-white dark:bg-[#1E1E1E] shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-primary mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
            </svg>
          </span>
          <h1 className="text-2xl font-medium text-[#212121] dark:text-white">Hand Motion Tracking</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span 
              className={`inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-[#4CAF50]' : 'bg-[#FF5252]'} mr-2`}
            ></span>
            <span className="text-sm text-[#212121] dark:text-gray-300">{statusMessage}</span>
          </div>
          <button 
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <span className="text-[#212121] dark:text-white">
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              )}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

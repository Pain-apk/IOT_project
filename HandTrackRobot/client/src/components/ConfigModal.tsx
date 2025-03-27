import { useState, useEffect } from 'react';
import { ConnectionConfig } from '@/types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ConnectionConfig) => void;
  currentConfig: ConnectionConfig;
}

export function ConfigModal({ isOpen, onClose, onSave, currentConfig }: ConfigModalProps) {
  const [config, setConfig] = useState<ConnectionConfig>(currentConfig);

  // Reset config when modal opens with current values
  useEffect(() => {
    if (isOpen) {
      setConfig(currentConfig);
    }
  }, [isOpen, currentConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setConfig({
        ...config,
        [id]: checked
      });
    } else if (type === 'number') {
      setConfig({
        ...config,
        [id]: parseInt(value, 10)
      });
    } else {
      setConfig({
        ...config,
        [id]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-lg max-w-md w-full transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-[#212121] dark:text-white">Connection Configuration</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Connection Instructions</h4>
              <p className="text-blue-600 dark:text-blue-400 mb-2">
                1. Make sure your Raspberry Pi and computer are on the same network
              </p>
              <p className="text-blue-600 dark:text-blue-400 mb-2">
                2. Enter the IP address of your Raspberry Pi below
              </p>
              <p className="text-blue-600 dark:text-blue-400">
                3. Set the port to match your Pi code (default: 5000)
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="raspberryPiIp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Raspberry Pi IP Address
              </label>
              <input 
                type="text" 
                id="raspberryPiIp" 
                value={config.raspberryPiIp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#2196F3] focus:border-[#2196F3] dark:bg-gray-700 dark:text-white" 
                placeholder="192.168.1.100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Find your Pi's IP using 'hostname -I' on the Raspberry Pi</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="portNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Port Number
              </label>
              <div className="flex space-x-2">
                <input 
                  type="number" 
                  id="portNumber" 
                  value={config.portNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#2196F3] focus:border-[#2196F3] dark:bg-gray-700 dark:text-white" 
                  placeholder="5000"
                />
                <button 
                  type="button"
                  onClick={() => setConfig({...config, portNumber: 5000})}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
                  title="Set to default Raspberry Pi port (5000)"
                >
                  Default
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Your Raspberry Pi code uses port 5000</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="updateFrequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Update Frequency (Hz)
              </label>
              <input 
                type="range" 
                id="updateFrequency" 
                min="1" 
                max="30" 
                value={config.updateFrequency}
                onChange={handleChange}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">1 Hz</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {config.updateFrequency} Hz
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">30 Hz</span>
              </div>
            </div>
            
            <div className="flex items-center mb-4">
              <input 
                type="checkbox" 
                id="enableCompression" 
                checked={config.enableCompression}
                onChange={handleChange}
                className="w-4 h-4 text-[#2196F3] focus:ring-[#2196F3] border-gray-300 rounded"
              />
              <label htmlFor="enableCompression" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable data compression
              </label>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-end rounded-b-lg">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 mr-3"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-[#2196F3] text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-600"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { FaSwatchbook, FaTimes, FaCheck } from 'react-icons/fa';

interface BackgroundSelectorProps {
  onColorSelect: (color: string) => void;
  currentColor: string;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ 
  onColorSelect, 
  currentColor 
}) => {
  const [selectedTab, setSelectedTab] = useState<'solid' | 'gradient'>('solid');
  const [selectedColor, setSelectedColor] = useState<string>(currentColor || '#ffffff');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [animateClass, setAnimateClass] = useState<string>('');

  // Predefined color options
  const solidColors = [
    '#ffffff', '#f2f2f7', '#e5e5ea', '#d1d1d6', 
    '#c7c7cc', '#aeaeb2', '#8e8e93', '#636366',
    '#48484a', '#3a3a3c', '#2c2c2e', '#1c1c1e',
    '#007aff', '#34c759', '#ff9500', '#ff2d55', 
    '#af52de', '#5856d6', '#ff3b30', '#ffcc00'
  ];
  
  const gradients = [
    'linear-gradient(135deg, #FF9500, #FF2D55)',
    'linear-gradient(135deg, #AF52DE, #5856D6)',
    'linear-gradient(135deg, #007AFF, #5AC8FA)',
    'linear-gradient(135deg, #34C759, #5AC8FA)',
    'linear-gradient(135deg, #FF3B30, #FF9500)',
    'linear-gradient(135deg, #5856D6, #007AFF)',
    'linear-gradient(135deg, #8E8E93, #636366)',
    'linear-gradient(135deg, #48484A, #1C1C1E)'
  ];

  // Handle toggle modal
  const toggle = () => {
    if (isOpen) {
      setAnimateClass('animate-fade-out');
      setTimeout(() => {
        setIsOpen(false);
        setAnimateClass('');
      }, 300);
    } else {
      setIsOpen(true);
      setAnimateClass('animate-fade-in');
    }
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
    toggle();
  };

  // Update selected color when currentColor changes
  useEffect(() => {
    if (currentColor) {
      setSelectedColor(currentColor);
    }
  }, [currentColor]);

  return (
    <div className="relative z-10">
      <button
        onClick={toggle}
        className="flex items-center justify-center p-2 rounded-full hover:bg-opacity-80 transition-all duration-300 bg-gray-200 dark:bg-gray-800"
        aria-label="Select Background"
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <div className="w-5 h-5 rounded-full overflow-hidden" style={{ 
          background: selectedColor.startsWith('linear-gradient') ? selectedColor : selectedColor,
          border: '1px solid rgba(0,0,0,0.1)'
        }}></div>
        <span className="ml-2 text-sm font-medium">Background</span>
      </button>

      {isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${animateClass}`}>
          <div 
            className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={toggle}
          ></div>
          
          <div className={`apple-card w-80 max-w-md z-10 p-4 ${animateClass}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Background</h3>
              <button 
                onClick={toggle}
                className="rounded-full p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                  selectedTab === 'solid' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setSelectedTab('solid')}
              >
                Solid Colors
              </button>
              <button
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                  selectedTab === 'gradient' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setSelectedTab('gradient')}
              >
                Gradients
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {selectedTab === 'solid' ? (
                solidColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-full aspect-square rounded-lg relative hover:scale-105 transition-transform"
                    style={{ 
                      background: color,
                      border: color === '#ffffff' ? '1px solid #e5e5ea' : 'none',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                    aria-label={`Select color ${color}`}
                  >
                    {selectedColor === color && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <FaCheck className={color === '#ffffff' || color === '#f2f2f7' || color === '#e5e5ea' ? 'text-black' : 'text-white'} />
                      </span>
                    )}
                  </button>
                ))
              ) : (
                gradients.map((gradient) => (
                  <button
                    key={gradient}
                    onClick={() => handleColorSelect(gradient)}
                    className="w-full aspect-square rounded-lg hover:scale-105 transition-transform"
                    style={{ 
                      background: gradient,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                    aria-label={`Select gradient ${gradient}`}
                  >
                    {selectedColor === gradient && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaCheck className="text-white" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector; 
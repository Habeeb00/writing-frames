import React, { useState, useEffect } from 'react';
import { FaPaintBrush, FaImage } from 'react-icons/fa';

interface BackgroundSelectorProps {
  onColorSelect: (color: string) => void;
  currentColor: string;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  onColorSelect,
  currentColor,
}) => {
  const [selectedTab, setSelectedTab] = useState<'solid' | 'gradient'>('solid');
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [isOpen, setIsOpen] = useState(false);
  const [animation, setAnimation] = useState('');

  // Predefined color palettes
  const solidColors = [
    '#FFFFFF', '#F2F2F7', '#E5E5EA', '#D1D1D6', 
    '#C7C7CC', '#AEAEB2', '#8E8E93', '#636366',
    '#48484A', '#3A3A3C', '#2C2C2E', '#1C1C1E',
    '#000000', '#FF9500', '#FF2D55', '#AF52DE',
    '#5856D6', '#007AFF', '#5AC8FA', '#34C759',
  ];

  const gradients = [
    'linear-gradient(to right, #FF9500, #FF2D55)',
    'linear-gradient(to right, #5856D6, #AF52DE)',
    'linear-gradient(to right, #007AFF, #5AC8FA)',
    'linear-gradient(to right, #34C759, #5AC8FA)',
    'linear-gradient(to bottom right, #000000, #3A3A3C)',
    'linear-gradient(to bottom right, #FFFFFF, #D1D1D6)',
  ];

  useEffect(() => {
    setSelectedColor(currentColor);
  }, [currentColor]);

  const handleToggle = () => {
    if (isOpen) {
      setAnimation('animate-fade-out');
      setTimeout(() => {
        setIsOpen(false);
        setAnimation('');
      }, 300);
    } else {
      setIsOpen(true);
      setAnimation('animate-fade-in');
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 rounded-lg px-3 py-2 bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-300"
        aria-label="Select background"
      >
        <FaPaintBrush className="text-gray-700 dark:text-gray-300" />
        <div 
          className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-700" 
          style={{ backgroundColor: selectedColor }}
        />
      </button>

      {/* Color picker modal */}
      {isOpen && (
        <div 
          className={`absolute top-full mt-2 right-0 w-64 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 ${animation} z-50`}
          style={{ transformOrigin: 'top right' }}
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              className={`flex-1 py-2 font-medium text-sm transition-colors duration-200 ${
                selectedTab === 'solid' 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setSelectedTab('solid')}
            >
              Solid Colors
            </button>
            <button
              className={`flex-1 py-2 font-medium text-sm transition-colors duration-200 ${
                selectedTab === 'gradient' 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setSelectedTab('gradient')}
            >
              Gradients
            </button>
          </div>

          {/* Color grid */}
          <div className="p-3">
            {selectedTab === 'solid' ? (
              <div className="grid grid-cols-5 gap-2">
                {solidColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(color)}
                    className={`w-10 h-10 rounded-lg transition-transform duration-200 hover:scale-110 ${
                      selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {gradients.map((gradient, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(gradient)}
                    className={`w-full h-16 rounded-lg transition-transform duration-200 hover:scale-105 ${
                      selectedColor === gradient ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                    }`}
                    style={{ background: gradient }}
                    aria-label={`Gradient ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector; 
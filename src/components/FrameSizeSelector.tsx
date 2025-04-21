import React, { useState } from 'react';
import { FRAME_SIZES, FrameSize } from '../constants/frameSizes';

interface FrameSizeSelectorProps {
  onSizeChange: (size: FrameSize) => void;
  currentSize: FrameSize;
  isDarkMode: boolean;
}

const FrameSizeSelector: React.FC<FrameSizeSelectorProps> = ({
  onSizeChange,
  currentSize,
  isDarkMode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState(currentSize.width.toString());
  const [customHeight, setCustomHeight] = useState(currentSize.height.toString());

  // Group sizes by category
  const categories = FRAME_SIZES.reduce((acc, size) => {
    if (!acc[size.category]) {
      acc[size.category] = [];
    }
    acc[size.category].push(size);
    return acc;
  }, {} as Record<string, FrameSize[]>);

  const handleCustomSizeChange = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    if (width > 0 && height > 0) {
      onSizeChange({
        name: 'Custom',
        width,
        height,
        category: 'Custom'
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 flex items-center justify-between rounded-lg transition-all duration-300 ease-in-out ${
          isDarkMode
            ? 'bg-[#111]/80 hover:bg-[#222]/80 text-[#f9f6e5] border border-white/10'
            : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
        }`}
      >
        <span>
          {currentSize.name} ({currentSize.width}x{currentSize.height})
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 rounded-lg shadow-xl transition-all duration-300 ease-in-out ${
          isDarkMode
            ? 'bg-[#111]/95 border border-white/10'
            : 'bg-white border border-gray-200'
        }`}>
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(categories).map(([category, sizes]) => (
              <div key={category} className="p-2">
                <h3 className={`text-sm font-medium px-2 py-1 ${
                  isDarkMode ? 'text-[#f9f6e5]/60' : 'text-gray-500'
                }`}>
                  {category}
                </h3>
                <div className="space-y-1">
                  {sizes.map((size) => (
                    <button
                      key={`${size.name}-${size.width}-${size.height}`}
                      onClick={() => {
                        onSizeChange(size);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left rounded transition-all duration-200 ${
                        currentSize.name === size.name
                          ? isDarkMode
                            ? 'bg-white/10 text-[#f9f6e5]'
                            : 'bg-blue-50 text-blue-600'
                          : isDarkMode
                            ? 'hover:bg-white/5 text-[#f9f6e5]'
                            : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {size.name} ({size.width}x{size.height})
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Custom size inputs */}
            <div className="p-2 border-t border-white/10">
              <h3 className={`text-sm font-medium px-2 py-1 ${
                isDarkMode ? 'text-[#f9f6e5]/60' : 'text-gray-500'
              }`}>
                Custom Size
              </h3>
              <div className="grid grid-cols-2 gap-2 p-2">
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  placeholder="Width"
                  className={`px-3 py-2 rounded transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-black/50 border border-white/10 text-[#f9f6e5] focus:border-blue-500/50'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500'
                  }`}
                />
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  placeholder="Height"
                  className={`px-3 py-2 rounded transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-black/50 border border-white/10 text-[#f9f6e5] focus:border-blue-500/50'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>
              <button
                onClick={() => {
                  handleCustomSizeChange();
                  setIsOpen(false);
                }}
                className={`w-full mt-2 px-4 py-2 rounded transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                }`}
              >
                Apply Custom Size
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameSizeSelector; 
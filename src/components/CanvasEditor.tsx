import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { ChromePicker } from 'react-color';
import { FaBold, FaItalic, FaUnderline, FaHeading, FaTrash, FaUndo, FaRedo, FaPalette, FaPlus, FaAlignLeft, FaAlignCenter, FaAlignRight, FaMagic, FaImage } from 'react-icons/fa';
import { TextBox, Font, SelectionEvent } from '../types';
import FrameSizeSelector from './FrameSizeSelector';
import { FrameSize, DEFAULT_FRAME_SIZE } from '../constants/frameSizes';

type TextAlign = 'left' | 'center' | 'right' | 'justify';

interface CanvasEditorProps {
  onSave: (canvas: fabric.Canvas) => void;
  initialContent?: string;
  fonts: Font[];
  isDarkMode?: boolean;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ onSave, initialContent, fonts = [], isDarkMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#F5F5F5');
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'none'>('none');
  const [gradientColors, setGradientColors] = useState<string[]>(['#F5F5F5', '#E8E8E8']);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(20);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [frameSize, setFrameSize] = useState<FrameSize>(DEFAULT_FRAME_SIZE);
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [layoutVariationIndex, setLayoutVariationIndex] = useState(0);
  const [showGradientSelector, setShowGradientSelector] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [imagePresets, setImagePresets] = useState<string[]>([
    'https://images.unsplash.com/photo-1595064085577-7c2cabf8b258?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1696643830146-44a8835c06ad?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop'
  ]);

  // Color scheme suggestions based on dark/light mode
  const colorSchemes = isDarkMode ? [
    { text: '#ffffff', background: '#1a1a1a', accent: '#7C3AED' },
    { text: '#E5E7EB', background: '#111827', accent: '#3B82F6' },
    { text: '#F9FAFB', background: '#1F2937', accent: '#10B981' },
    { text: '#F3F4F6', background: '#312E81', accent: '#EC4899' },
    { text: '#ffffff', background: '#1E3A8A', accent: '#F59E0B' }
  ] : [
    { text: '#1F2937', background: '#ffffff', accent: '#8B5CF6' },
    { text: '#111827', background: '#F9FAFB', accent: '#3B82F6' },
    { text: '#064E3B', background: '#ECFDF5', accent: '#059669' },
    { text: '#831843', background: '#FCE7F3', accent: '#DB2777' },
    { text: '#1E3A8A', background: '#EFF6FF', accent: '#F59E0B' }
  ];

  // Layout variations
  const getLayoutVariations = (objects: fabric.IText[]): { left: number; top: number; textAlign: 'left' | 'center' | 'right' }[][] => {
    if (!canvas) return [];
    
    const canvasWidth = canvas.width || 800;
    const canvasHeight = canvas.height || 600;
    const padding = 50;
    
    return [
      // Center-aligned layout
      objects.map((_, index) => ({
        left: canvasWidth / 2,
        top: padding + (index * (canvasHeight - 2 * padding)) / (objects.length - 1 || 1),
        textAlign: 'center' as 'left' | 'center' | 'right'
      })),
      // Left-aligned layout
      objects.map((_, index) => ({
        left: padding,
        top: padding + (index * (canvasHeight - 2 * padding)) / (objects.length - 1 || 1),
        textAlign: 'left' as 'left' | 'center' | 'right'
      })),
      // Right-aligned layout
      objects.map((_, index) => ({
        left: canvasWidth - padding,
        top: padding + (index * (canvasHeight - 2 * padding)) / (objects.length - 1 || 1),
        textAlign: 'right' as 'left' | 'center' | 'right'
      })),
      // Staggered layout
      objects.map((_, index) => ({
        left: padding + ((index % 2) * (canvasWidth - 2 * padding)),
        top: padding + (index * (canvasHeight - 2 * padding)) / (objects.length - 1 || 1),
        textAlign: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'center' | 'right'
      })),
      // Diagonal layout
      objects.map((_, index) => ({
        left: padding + (index * (canvasWidth - 2 * padding)) / (objects.length - 1 || 1),
        top: padding + (index * (canvasHeight - 2 * padding)) / (objects.length - 1 || 1),
        textAlign: 'center' as 'left' | 'center' | 'right'
      }))
    ];
  };

  // Function to generate random pale colors adjusted for dark mode
  const generateRandomPaleColor = (): string => {
    if (isDarkMode) {
      // For dark mode, use more saturated colors with higher lightness
      const h = Math.floor(Math.random() * 360); // Hue: 0-359
      const s = Math.floor(Math.random() * 40) + 40; // Saturation: 40%-80%
      const l = Math.floor(Math.random() * 20) + 60; // Lightness: 60%-80%
      return `hsl(${h}, ${s}%, ${l}%)`;
    } else {
      // For light mode, use pale colors
      const h = Math.floor(Math.random() * 360); // Hue: 0-359
      const s = Math.floor(Math.random() * 30) + 20; // Saturation: 20%-50%
      const l = Math.floor(Math.random() * 20) + 75; // Lightness: 75%-95% (pale)
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  };

  // Get contrasting text color based on background brightness
  const getContrastingTextColor = (bgColor: string): string => {
    const brightness = getColorBrightness(bgColor);
    return brightness > 128 ? '#000000' : '#ffffff';
  };
  
  // Get contrasting border color based on background brightness
  const getContrastingBorderColor = (bgColor: string): string => {
    const brightness = getColorBrightness(bgColor);
    return brightness > 128 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
  };

  // Function to calculate brightness of a color
  const getColorBrightness = (color: string): number => {
    // Handle gradient case
    if (color.includes('gradient')) {
      return 128; // Default to middle brightness for gradients
    }

    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Calculate brightness using the formula: (0.299*R + 0.587*G + 0.114*B)
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  // Function to apply a random background color
  const applyRandomBackgroundColor = () => {
    if (!canvas || !canvas.getContext()) return;
    
    const currentIndex = colorPresets.indexOf(backgroundColor);
    const nextIndex = (currentIndex + 1) % colorPresets.length;
    const nextColor = colorPresets[nextIndex];
    
    // First clone all existing objects to preserve them
    const serializedObjects = canvas.toJSON(['id', 'selectable']).objects || [];
    
    // Update text colors for visibility
    updateTextColors(nextColor);
    
    // Update state
    setBackgroundColor(nextColor);
    setGradientType('none');
    setBackgroundImage(null);
    
    try {
      // Use a more direct approach to set background color
      canvas.setBackgroundColor(nextColor, canvas.renderAll.bind(canvas));
      canvas.selectionColor = 'rgba(0, 0, 0, 0.1)';
      canvas.selectionBorderColor = getContrastingBorderColor(nextColor);
      saveToHistory();
    } catch (error) {
      console.error('Error setting background color:', error);
    }
  };

  // Function to apply a random text color
  const applyRandomTextColor = () => {
    if (canvas && selectedObject && selectedObject.type === 'textbox') {
      const newColor = generateRandomPaleColor();
      setTextColor(newColor);
      selectedObject.set('fill', newColor);
      canvas.renderAll();
      saveToHistory();
    }
  };

  // Update color presets with paler colors
  const colorPresets = [
    // Soft primary colors
    '#FFB6B6', '#B6FFB6', '#B6B6FF', '#FFFFB6', '#FFB6FF', '#B6FFFF',
    // Muted colors
    '#FFD4B6', '#FFE4B6', '#FFF0B6', '#B6FFD4', '#B6E4FF', '#D4B6FF',
    // Pastel colors
    '#FFE4E1', '#E1FFE4', '#E1E4FF', '#FFF0E1', '#E1F0FF', '#F0E1FF',
    // Light neutrals
    '#F5F5F5', '#F0F0F0', '#E6E6E6', '#DCDCDC', '#D3D3D3', '#C8C8C8'
  ];

  // Update gradient presets with paler combinations
  const gradientPresets = [
    // Soft primary gradients
    { type: 'linear', colors: ['#FFB6B6', '#FFD4B6'] },
    { type: 'linear', colors: ['#B6FFB6', '#B6FFD4'] },
    { type: 'linear', colors: ['#B6B6FF', '#D4B6FF'] },
    { type: 'linear', colors: ['#FFFFB6', '#FFE4B6'] },
    { type: 'linear', colors: ['#FFB6FF', '#F0E1FF'] },
    // Muted gradients
    { type: 'linear', colors: ['#FFE4E1', '#FFF0E1'] },
    { type: 'linear', colors: ['#E1FFE4', '#E1F0FF'] },
    { type: 'linear', colors: ['#E1E4FF', '#F0E1FF'] },
    { type: 'linear', colors: ['#F5F5F5', '#E6E6E6'] },
    // Pastel gradients
    { type: 'linear', colors: ['#FFE4E1', '#E1FFE4'] },
    { type: 'linear', colors: ['#E1E4FF', '#E1F0FF'] },
    { type: 'linear', colors: ['#FFF0E1', '#F0E1FF'] },
    // Radial versions of the same gradients
    { type: 'radial', colors: ['#FFB6B6', '#FFD4B6'] },
    { type: 'radial', colors: ['#B6FFB6', '#B6FFD4'] },
    { type: 'radial', colors: ['#B6B6FF', '#D4B6FF'] },
    { type: 'radial', colors: ['#FFFFB6', '#FFE4B6'] },
    { type: 'radial', colors: ['#FFB6FF', '#F0E1FF'] }
  ];

  // Add a new function to handle text color updates
  const updateTextColors = (bgColor: string) => {
    if (!canvas) return;
    
    const newTextColor = getContrastingTextColor(bgColor);
    setTextColor(newTextColor);
    
    const textObjects = canvas.getObjects().filter(obj => obj.type === 'textbox');
    textObjects.forEach(textObj => {
      textObj.set('fill', newTextColor);
    });
    canvas.renderAll();
  };

  // Function to apply an image background
  const applyImageBackground = (imageUrl: string) => {
    if (!canvas) return;
    
    try {
      // Save current objects
      const objects = canvas.getObjects();
      
      // Update text colors for visibility
      updateTextColors('#ffffff'); // Default to white text on images
      
      // Set background type
      setBackgroundImage(imageUrl);
      setGradientType('none');
      
      fabric.Image.fromURL(imageUrl, (img) => {
        // Scale image to fit canvas
        const canvasWidth = canvas.getWidth() || 800;
        const canvasHeight = canvas.getHeight() || 600;
        
        // Scale to cover the entire canvas while maintaining aspect ratio
        const scaleX = canvasWidth / img.width!;
        const scaleY = canvasHeight / img.height!;
        const scale = Math.max(scaleX, scaleY);
        
        img.set({
          originX: 'center',
          originY: 'center',
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          scaleX: scale,
          scaleY: scale
        });
        
        canvas.setBackgroundImage(img, () => {
          // Ensure all objects are still on the canvas
          if (objects.length > 0 && canvas.getObjects().length === 0) {
            objects.forEach(obj => {
              canvas.add(obj);
            });
          }
          
          canvas.selectionColor = 'rgba(255, 255, 255, 0.2)';
          canvas.selectionBorderColor = 'rgba(255, 255, 255, 0.8)';
          canvas.renderAll();
          saveToHistory();
        });
      }, { crossOrigin: 'anonymous' });
    } catch (error) {
      console.error('Error applying image background:', error);
    }
  };

  // Handle file upload for custom images
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        applyImageBackground(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update the canvas initialization
  useEffect(() => {
    if (canvasRef.current) {
      try {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: frameSize.width,
        height: frameSize.height,
          backgroundColor: backgroundColor as any, // Cast to any to avoid TypeScript error
          selectionBorderColor: getContrastingBorderColor(backgroundColor),
          selectionLineWidth: 2,
          selectionDashArray: [5, 5],
          selectionColor: 'rgba(0, 0, 0, 0.1)',
          selectionFullyContained: true,
          selectionKey: 'shiftKey',
          selection: true,
          defaultCursor: 'default',
          hoverCursor: 'move',
          moveCursor: 'move'
        });

        // Custom control rendering function
        function renderControl(position: string) {
          return function(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) {
            const size = 8;
            const stroke = getContrastingBorderColor(backgroundColor);
            const fill = backgroundColor.includes('gradient') ? '#ffffff' : backgroundColor;
            
            ctx.save();
            ctx.translate(left, top);
            ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
            ctx.strokeStyle = stroke;
            ctx.fillStyle = fill;
            ctx.lineWidth = 2;
            
            // Draw control point
            ctx.beginPath();
            ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
          };
        }

        // Add custom controls to the prototype
        fabric.Object.prototype.setControlsVisibility({
          tl: true,
          tr: true,
          bl: true,
          br: true
        });

        // Update control rendering
        const scaleHandler = (eventData: MouseEvent, transform: any, x: number, y: number) => {
          const target = transform.target;
          const size = target._getTransformedDimensions();
          const scaleX = x / size.x;
          const scaleY = y / size.y;
          target.scaleX = scaleX;
          target.scaleY = scaleY;
          return true;
        };

        fabric.Object.prototype.controls = {
          tl: new fabric.Control({
            x: -0.5,
            y: -0.5,
            actionHandler: scaleHandler,
            cursorStyle: 'nw-resize',
            actionName: 'scale',
            render: renderControl('tl'),
          }),
          tr: new fabric.Control({
            x: 0.5,
            y: -0.5,
            actionHandler: scaleHandler,
            cursorStyle: 'ne-resize',
            actionName: 'scale',
            render: renderControl('tr'),
          }),
          bl: new fabric.Control({
            x: -0.5,
            y: 0.5,
            actionHandler: scaleHandler,
            cursorStyle: 'sw-resize',
            actionName: 'scale',
            render: renderControl('bl'),
          }),
          br: new fabric.Control({
            x: 0.5,
            y: 0.5,
            actionHandler: scaleHandler,
            cursorStyle: 'se-resize',
            actionName: 'scale',
            render: renderControl('br'),
          })
        };

      // Store frame size metadata on the canvas element
      const canvasEl = fabricCanvas.getElement();
      if (canvasEl) {
        canvasEl.setAttribute('data-frame-name', frameSize.name);
        canvasEl.setAttribute('data-frame-category', frameSize.category);
        canvasEl.setAttribute('data-frame-width', frameSize.width.toString());
        canvasEl.setAttribute('data-frame-height', frameSize.height.toString());
      }

      // Scale the canvas container to fit in the view
      const containerWidth = 800;
      const containerHeight = 600;
      const scaleX = containerWidth / frameSize.width;
      const scaleY = containerHeight / frameSize.height;
      const scale = Math.min(scaleX, scaleY);

      // Add event listeners
      fabricCanvas.on('selection:created', (e: any) => {
        setSelectedObject(e.selected?.[0] || null);
      });

      fabricCanvas.on('selection:updated', (e: any) => {
        setSelectedObject(e.selected?.[0] || null);
      });

      fabricCanvas.on('selection:cleared', () => {
        setSelectedObject(null);
      });

      // Save state to history on object modification
      fabricCanvas.on('object:modified', () => {
        saveToHistory(fabricCanvas);
      });

        // Wait for canvas to be fully initialized
        setTimeout(() => {
      setCanvas(fabricCanvas);
          saveToHistory(fabricCanvas);
        }, 100);

      return () => {
        fabricCanvas.dispose();
      };
      } catch (error) {
        console.error('Error initializing canvas:', error);
      }
    }
  }, [frameSize, backgroundColor]);

  const saveToHistory = (canvasToSave: fabric.Canvas = canvas!) => {
    if (!canvasToSave) return;
    
    const json = canvasToSave.toJSON();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(json));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && canvas) {
      const newIndex = historyIndex - 1;
      canvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
        canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && canvas) {
      const newIndex = historyIndex + 1;
      canvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
        canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  // Function to calculate default text size based on frame size
  const getDefaultTextSize = (type: 'heading' | 'subheading' | 'paragraph') => {
    const baseSize = Math.min(frameSize.width, frameSize.height);
    const scaleFactor = baseSize / 800; // Using 800 as base reference size
    
    switch (type) {
      case 'heading':
        return Math.round(32 * scaleFactor);
      case 'subheading':
        return Math.round(24 * scaleFactor);
      case 'paragraph':
        return Math.round(16 * scaleFactor);
      default:
        return Math.round(16 * scaleFactor);
    }
  };

  // Update the addText function to use the current text color
  const addText = (type: 'heading' | 'subheading' | 'paragraph' = 'paragraph') => {
    if (canvas) {
      const position = findPositionForText(type);
      const fontSize = getDefaultTextSize(type);
      
      // Calculate intelligent width based on frame size and text type
      const frameWidth = frameSize.width;
      const frameHeight = frameSize.height;
      
      // Calculate base width (60% of frame width for headings, 70% for paragraphs)
      const baseWidth = type === 'paragraph' ? frameWidth * 0.7 : frameWidth * 0.6;
      
      // Calculate padding based on frame size
      const horizontalPadding = Math.min(frameWidth * 0.03, 30);
      const verticalPadding = Math.min(frameHeight * 0.03, 20);
      
      // Calculate max width with padding, ensuring it doesn't exceed frame width
      const maxWidth = Math.min(baseWidth - (horizontalPadding * 2), frameWidth - (horizontalPadding * 2));
      
      // Calculate line height based on font size
      const lineHeight = fontSize * 1.2;

      const text = new fabric.Textbox('Type here', {
        left: position.left,
        top: position.top,
        fontSize: fontSize,
        fontFamily: 'Resist Mono Variable',
        fill: textColor,
        width: maxWidth,
        height: lineHeight * 2,
        textAlign: type === 'paragraph' ? 'left' : 'center',
        padding: horizontalPadding,
        lineHeight: 1.2,
        splitByGrapheme: true,
        minWidth: frameWidth * 0.3,
        lockScalingX: true,
        lockScalingY: false,
        lockRotation: true,
        hasControls: true,
        hasBorders: true,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        cornerColor: 'rgba(0, 0, 0, 0.5)',
        cornerSize: 8,
        transparentCorners: false
      });

      // Add event listener to prevent text box from going beyond frame boundaries
      text.on('scaling', () => {
        const obj = text;
        const scaleY = obj.scaleY || 1;
        const objHeight = obj.height || 0;
        const height = objHeight * scaleY;
        const top = obj.top || 0;

        // Only allow vertical scaling to increase size
        if (scaleY < 1) {
          obj.scaleY = 1;
        }

        // Prevent scaling beyond frame boundaries
        if (top + height > frameHeight) {
          obj.scaleY = (frameHeight - top) / objHeight;
        }
        if (top < 0) {
          obj.top = 0;
        }
      });

      // Add event listener to prevent dragging beyond frame boundaries
      text.on('moving', () => {
        const obj = text;
        const objWidth = obj.width || 0;
        const objHeight = obj.height || 0;
        const height = objHeight * (obj.scaleY || 1);
        const left = obj.left || 0;
        const top = obj.top || 0;

        // Prevent moving beyond frame boundaries
        if (left + objWidth > frameWidth) {
          obj.left = frameWidth - objWidth;
        }
        if (top + height > frameHeight) {
          obj.top = frameHeight - height;
        }
        if (left < 0) {
          obj.left = 0;
        }
        if (top < 0) {
          obj.top = 0;
        }
      });

      // Add event listener to adjust height based on content
      text.on('changed', () => {
        const obj = text;
        const textHeight = obj.calcTextHeight();
        const minHeight = lineHeight * 2;
        const newHeight = Math.max(textHeight, minHeight);
        
        if (obj.height !== newHeight) {
          obj.set('height', newHeight);
          canvas.renderAll();
        }
      });

      // Center the text box horizontally if it's a heading
      if (type !== 'paragraph') {
        text.set({
          originX: 'center',
          left: frameWidth / 2
        });
      }

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      saveToHistory();
    }
  };

  // Update the findPositionForText function to use scaled padding
  const findPositionForText = (type: 'heading' | 'subheading' | 'paragraph') => {
    if (!canvas) return { left: 50, top: 50 };
    
    const basePadding = Math.min(frameSize.width, frameSize.height) * 0.05; // 5% of smaller dimension
    const objects = canvas.getObjects();
    
    // Default positions based on text type
    if (type === 'heading') {
      return { 
        left: frameSize.width / 2,
        top: basePadding + (frameSize.height * 0.05) // 5% from top
      };
    } else if (type === 'subheading') {
      const headings = objects.filter(obj => 
        obj.type === 'textbox' && (obj as any).fontSize >= getDefaultTextSize('heading')
      );
      
      if (headings.length > 0) {
        const lastHeading = headings[headings.length - 1];
        return { 
          left: frameSize.width / 2,
          top: lastHeading.top! + lastHeading.height! + (frameSize.height * 0.03) // 3% spacing
        };
      }
      
      return { 
        left: frameSize.width / 2, 
        top: basePadding + (frameSize.height * 0.15) // 15% from top
      };
    } else {
      if (objects.length > 0) {
        let lowestPoint = basePadding;
        objects.forEach(obj => {
          const bottom = obj.top! + obj.height!;
          if (bottom > lowestPoint) lowestPoint = bottom;
        });
        
        return { 
          left: basePadding, 
          top: lowestPoint + (frameSize.height * 0.03) // 3% spacing
        };
      }
      
      return { 
        left: basePadding, 
        top: basePadding + (frameSize.height * 0.2) // 20% from top
      };
    }
  };

  // Function to check if text overflows the frame
  const checkTextOverflow = (textObject: fabric.Textbox): boolean => {
    if (!canvas) return false;
    const textHeight = textObject.height || 0;
    const textTop = textObject.top || 0;
    return textTop + textHeight > frameSize.height;
  };

  // Function to handle text overflow
  const handleTextOverflow = (textObject: fabric.Textbox) => {
    if (checkTextOverflow(textObject)) {
      // Create a new frame or move to next frame
      // For now, we'll just alert the user
      alert('Text overflows the frame. Consider creating a new frame or adjusting the text size.');
    }
  };

  const handleTextFormat = (format: 'bold' | 'italic' | 'underline' | 'delete') => {
    if (canvas && selectedObject && selectedObject.type === 'textbox') {
      const text = selectedObject;
      switch (format) {
        case 'bold':
          text.set('fontWeight', text.fontWeight === 'bold' ? 'normal' : 'bold');
          break;
        case 'italic':
          text.set('fontStyle', text.fontStyle === 'italic' ? 'normal' : 'italic');
          break;
        case 'underline':
          text.set('underline', !text.underline);
          break;
        case 'delete':
          canvas.remove(text);
          break;
      }
      canvas.renderAll();
      saveToHistory();
    }
  };

  const handleFontChange = (font: string) => {
    if (canvas && selectedObject && selectedObject.type === 'textbox') {
      selectedObject.set('fontFamily', font);
      canvas.renderAll();
      saveToHistory();
    }
    setFontFamily(font);
  };

  const handleFontSizeChange = (size: number) => {
    if (canvas && selectedObject && selectedObject.type === 'textbox') {
      selectedObject.set('fontSize', size);
      canvas.renderAll();
      saveToHistory();
    }
    setFontSize(size);
  };

  const handleDownload = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
      });
      const link = document.createElement('a');
      link.download = `${frameSize.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  const handleFrameSizeChange = (newSize: FrameSize) => {
    if (canvas && (newSize.width !== frameSize.width || newSize.height !== frameSize.height)) {
      // Store current canvas content
      const json = canvas.toJSON();
      
      // Set data attributes on the canvas element for metadata storage
      const canvasEl = canvas.getElement();
      if (canvasEl) {
        canvasEl.setAttribute('data-frame-name', newSize.name);
        canvasEl.setAttribute('data-frame-category', newSize.category);
      }
      
      // Update frame size
      setFrameSize(newSize);
      
      // Canvas will be recreated via useEffect
    }
  };

  // Update the handleAutoLayout function
  const handleAutoLayout = () => {
    if (!canvas) return;
    
    const textObjects = canvas.getObjects().filter(obj => obj.type === 'textbox') as fabric.IText[];
    if (textObjects.length === 0) return;

    const variations = getLayoutVariations(textObjects);
    if (variations.length === 0) return;

    const currentVariationIndex = (layoutVariationIndex + 1) % variations.length;
    setLayoutVariationIndex(currentVariationIndex);

    textObjects.forEach((obj, index) => {
      const variation = variations[currentVariationIndex][index];
      obj.set({
        left: variation.left,
        top: variation.top,
        textAlign: variation.textAlign as 'left' | 'center' | 'right',
        originX: variation.textAlign === 'center' ? 'center' : variation.textAlign === 'right' ? 'right' : 'left',
        originY: 'center'
      });
    });

    canvas.renderAll();
    saveToHistory();
  };

  // Add clear frame function
  const clearFrame = () => {
    if (canvas) {
      canvas.clear();
      canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas));
      saveToHistory();
    }
  };

  // Update the color picker to handle opacity
  const updateBackgroundColor = (color: string) => {
    if (!canvas || !canvas.getContext()) return;
    
    try {
      // Update text colors first before changing background
      updateTextColors(color);
      
      // Update state
      setBackgroundColor(color);
      setGradientType('none');
      
      // Use setBackgroundColor which preserves objects
      canvas.setBackgroundColor(color, () => {
        canvas.renderAll();
      });
      
      canvas.selectionColor = 'rgba(0, 0, 0, 0.1)';
      canvas.selectionBorderColor = getContrastingBorderColor(color);
      saveToHistory();
    } catch (error) {
      console.error('Error updating background color:', error);
    }
  };

  // Update the gradient color picker to handle opacity
  const updateGradientColors = (startColor: string, endColor: string) => {
    if (!canvas || !canvas.getContext()) return;
    
    try {
      // Update text colors first before changing background
      updateTextColors(startColor);
      
      const newColors = [startColor, endColor];
      setGradientColors(newColors);
      
      // Create gradient
      const gradient = new fabric.Gradient({
        type: gradientType,
        coords: { x1: 0, y1: 0, x2: 0, y2: canvas.getHeight() || 0 },
        colorStops: [
          { offset: 0, color: startColor },
          { offset: 1, color: endColor }
        ]
      });
      
      // Use setBackgroundColor which preserves objects
      canvas.setBackgroundColor(gradient as any, () => {
        canvas.renderAll();
      });
      
      canvas.selectionColor = 'rgba(0, 0, 0, 0.1)';
      canvas.selectionBorderColor = getContrastingBorderColor(startColor);
      saveToHistory();
    } catch (error) {
      console.error('Error updating gradient colors:', error);
    }
  };

  // Apply gradient background
  const applyGradientBackground = () => {
    try {
      if (!canvas) return;
      
      // Use the gradientColors from state instead of from a ref
      const colorStops = [
        { color: gradientColors[0] },
        { color: gradientColors[1] }
      ];
      
      if (colorStops.length < 2) return;
      
      // Update text colors based on the first gradient color
      updateTextColors(colorStops[0].color);
      
      let gradient;
      if (gradientType === 'linear') {
        gradient = new fabric.Gradient({
          type: 'linear',
          coords: {
            x1: 0,
            y1: 0,
            x2: canvas.width || 500,
            y2: canvas.height || 500
          },
          colorStops: colorStops.map((stop: { color: string; offset?: number }, index: number) => ({
            offset: index / (colorStops.length - 1),
            color: stop.color
          }))
        });
      } else {
        gradient = new fabric.Gradient({
          type: 'radial',
          coords: {
            r1: 0,
            r2: canvas.width ? canvas.width / 2 : 250,
            x1: canvas.width ? canvas.width / 2 : 250,
            y1: canvas.height ? canvas.height / 2 : 250,
            x2: canvas.width ? canvas.width / 2 : 250,
            y2: canvas.height ? canvas.height / 2 : 250
          },
          colorStops: colorStops.map((stop: { color: string; offset?: number }, index: number) => ({
            offset: index / (colorStops.length - 1),
            color: stop.color
          }))
        });
      }
      
      // Use setBackgroundColor which preserves objects
      canvas.setBackgroundColor(gradient as any, () => {
        canvas.renderAll();
      });
      
      // Save state with history
      saveToHistory();
    } catch (error) {
      console.error('Error applying gradient background:', error);
    }
  };

  // Add filtered fonts function
  const filteredFonts = fonts.filter(font => 
    font.family.toLowerCase().includes(fontSearch.toLowerCase())
  );

  const handleTextAlign = (align: 'left' | 'center' | 'right') => {
    if (canvas && selectedObject && selectedObject.type === 'textbox') {
      selectedObject.set('textAlign', align);
      canvas.renderAll();
      saveToHistory();
    }
  };

  return (
    <div 
      className={`flex flex-col gap-6 p-6 rounded-xl ${isDarkMode ? 'bg-black text-gray-100' : 'bg-white text-gray-800'}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Canvas Editor
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleAutoLayout}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
              isDarkMode
                ? 'bg-[#2D2D2D] hover:bg-[#3A3A3A] text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Click to try different layouts and color schemes"
          >
            <FaMagic className={isDarkMode ? 'text-purple-400' : 'text-purple-500'} />
            <span className="hidden sm:inline" style={{ letterSpacing: '-0.01em' }}>Try AI Layout</span>
            <span className="text-xs opacity-50">{layoutVariationIndex + 1}</span>
          </button>
          <button
            onClick={() => setShowFrameSelector(!showFrameSelector)}
            className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-[#2D2D2D] hover:bg-[#3A3A3A] text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors flex items-center gap-1`}
          >
            <span className="hidden sm:inline" style={{ letterSpacing: '-0.01em' }}>{showFrameSelector ? 'Hide Frame' : 'Frame Size'}</span>
            <span className="inline sm:hidden" style={{ letterSpacing: '-0.01em' }}>{showFrameSelector ? 'Hide' : 'Size'}</span>
          </button>
          
          <button
            onClick={() => setShowFormatting(!showFormatting)}
            className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-[#2D2D2D] hover:bg-[#3A3A3A] text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors flex items-center gap-1 sm:hidden`}
          >
            <span style={{ letterSpacing: '-0.01em' }}>{showFormatting ? 'Hide Tools' : 'Show Tools'}</span>
          </button>
        </div>
      </div>

      {showFrameSelector && (
        <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-[#1A1A1A]' : 'bg-gray-50'} border ${isDarkMode ? 'border-[#333]' : 'border-gray-200'}`}>
          <FrameSizeSelector 
            onSizeChange={handleFrameSizeChange} 
            currentSize={frameSize} 
            isDarkMode={isDarkMode} 
          />
        </div>
      )}

      <div className={`${showFormatting || window.innerWidth >= 640 ? 'flex' : 'hidden'} flex-wrap gap-3 items-center p-4 rounded-xl ${isDarkMode ? 'bg-[#1A1A1A] border border-[#333]' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex gap-1 mr-2">
          <button 
            onClick={() => addText('heading')} 
            className={`p-2 rounded-l-md ${isDarkMode ? 'bg-[#2D2D2D] hover:bg-[#3A3A3A] text-gray-200' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            <FaHeading />
          </button>
          <button 
            onClick={() => addText('paragraph')} 
            className={`p-2 rounded-r-md ${isDarkMode ? 'bg-[#2D2D2D] hover:bg-[#3A3A3A] text-gray-200' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            <FaPlus />
          </button>
        </div>
        
        <div className={`flex gap-1 mr-2 p-1 rounded-md ${isDarkMode ? 'bg-[#2D2D2D]' : 'bg-gray-100'}`}>
          <button 
            onClick={() => handleTextFormat('bold')} 
            className={`p-1.5 rounded ${selectedObject?.fontWeight === 'bold' ? (isDarkMode ? 'bg-[#444]' : 'bg-gray-300') : ''} ${isDarkMode ? 'hover:bg-[#444]' : 'hover:bg-gray-200'}`}
            disabled={!selectedObject || selectedObject.type !== 'textbox'}
          >
            <FaBold size={14} />
          </button>
          <button 
            onClick={() => handleTextFormat('italic')} 
            className={`p-1.5 rounded ${selectedObject?.fontStyle === 'italic' ? (isDarkMode ? 'bg-[#444]' : 'bg-gray-300') : ''} ${isDarkMode ? 'hover:bg-[#444]' : 'hover:bg-gray-200'}`}
            disabled={!selectedObject || selectedObject.type !== 'textbox'}
          >
            <FaItalic size={14} />
          </button>
          <button 
            onClick={() => handleTextFormat('underline')} 
            className={`p-1.5 rounded ${selectedObject?.underline ? (isDarkMode ? 'bg-[#444]' : 'bg-gray-300') : ''} ${isDarkMode ? 'hover:bg-[#444]' : 'hover:bg-gray-200'}`}
            disabled={!selectedObject || selectedObject.type !== 'textbox'}
          >
            <FaUnderline size={14} />
          </button>
          <button 
            onClick={() => handleTextFormat('delete')} 
            className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-red-700/40 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-500'}`}
            disabled={!selectedObject}
            title="Delete Selected Text"
          >
            <FaTrash size={14} />
          </button>
        </div>

        <div className={`flex gap-1 mr-2 p-1 rounded-md ${isDarkMode ? 'bg-[#2D2D2D]' : 'bg-gray-100'}`}>
          <button 
            onClick={() => handleTextAlign('left')} 
            className={`p-1.5 rounded ${selectedObject?.textAlign === 'left' ? (isDarkMode ? 'bg-[#444]' : 'bg-gray-300') : ''} ${isDarkMode ? 'hover:bg-[#444]' : 'hover:bg-gray-200'}`}
            disabled={!selectedObject || selectedObject.type !== 'textbox'}
          >
            <FaAlignLeft size={14} />
          </button>
          <button 
            onClick={() => handleTextAlign('center')} 
            className={`p-1.5 rounded ${selectedObject?.textAlign === 'center' ? (isDarkMode ? 'bg-[#444]' : 'bg-gray-300') : ''} ${isDarkMode ? 'hover:bg-[#444]' : 'hover:bg-gray-200'}`}
            disabled={!selectedObject || selectedObject.type !== 'textbox'}
          >
            <FaAlignCenter size={14} />
          </button>
          <button 
            onClick={() => handleTextAlign('right')} 
            className={`p-1.5 rounded ${selectedObject?.textAlign === 'right' ? (isDarkMode ? 'bg-[#444]' : 'bg-gray-300') : ''} ${isDarkMode ? 'hover:bg-[#444]' : 'hover:bg-gray-200'}`}
            disabled={!selectedObject || selectedObject.type !== 'textbox'}
          >
            <FaAlignRight size={14} />
          </button>
        </div>

        <div className={`flex gap-1 mr-2 p-1 rounded-md ${isDarkMode ? 'bg-[#2D2D2D]' : 'bg-gray-100'}`}>
          <button 
            onClick={undo} 
            className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-[#444]' : 'hover:bg-gray-200'} ${historyIndex <= 0 ? 'opacity-50' : ''}`}
            disabled={historyIndex <= 0}
          >
            <FaUndo size={14} />
          </button>
          <button 
            onClick={redo} 
            className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-[#444]' : 'hover:bg-gray-200'} ${historyIndex >= history.length - 1 ? 'opacity-50' : ''}`}
            disabled={historyIndex >= history.length - 1}
          >
            <FaRedo size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
              isDarkMode
                ? 'bg-[#2D2D2D] border-[#444] text-gray-200'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
            >
              <span>{fontFamily}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showFontDropdown && (
              <div className="absolute z-50 mt-2 w-64 rounded-lg shadow-lg border overflow-hidden" 
                style={{
                  backgroundColor: isDarkMode ? '#1A1A1A' : 'white',
                  borderColor: isDarkMode ? '#444' : '#e5e7eb'
                }}>
                <div className="p-2">
                  <input
                    type="text"
                    value={fontSearch}
                    onChange={(e) => setFontSearch(e.target.value)}
                    placeholder="Search fonts..."
                    className={`w-full px-2 py-1 rounded border ${
                      isDarkMode
                        ? 'bg-[#2D2D2D] border-[#444] text-gray-200'
                        : 'bg-white border-gray-200 text-gray-800'
                    }`}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredFonts.map((font) => (
                    <button
                      key={font.family}
                      onClick={() => {
                        handleFontChange(font.family);
                        setShowFontDropdown(false);
                        setFontSearch('');
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#2D2D2D] ${
                        fontFamily === font.family ? (isDarkMode ? 'bg-[#2D2D2D]' : 'bg-gray-100') : ''
                      }`}
                      style={{ 
                        fontFamily: font.family,
                        color: isDarkMode ? '#e5e7eb' : '#1f2937'
                      }}
                    >
                {font.family}
                    </button>
            ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input 
            type="number" 
            value={fontSize} 
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className={`text-sm px-2 py-1 border rounded ${isDarkMode ? 'bg-[#2D2D2D] border-[#444] text-gray-200' : 'bg-white border-gray-300 text-gray-800'}`}
            min="8"
            max="72"
            disabled={!selectedObject || selectedObject.type !== 'textbox'}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 flex-wrap p-4 rounded-xl" 
           style={{ 
             backgroundColor: isDarkMode ? '#1A1A1A' : '#f9fafb',
             borderWidth: '1px',
             borderColor: isDarkMode ? '#333' : '#e5e7eb',
             borderStyle: 'solid'
           }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: isDarkMode ? '#9ca3af' : '#4b5563' }}>Text:</span>
          <div className="relative">
            <div 
              className={`w-8 h-8 rounded-full cursor-pointer border transition-transform hover:scale-110 ${isDarkMode ? 'border-[#444] shadow-lg' : 'border-gray-300 shadow-sm'}`}
              style={{ backgroundColor: textColor }}
              onClick={applyRandomTextColor}
            />
            <button 
              className={`absolute -top-1 -right-1 rounded-full p-1 shadow-sm ${isDarkMode ? 'bg-[#2D2D2D] border-[#444]' : 'bg-white border-gray-300'} border`}
              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
            >
              <FaPalette size={8} />
            </button>
            {showTextColorPicker && (
              <div className="absolute top-10 left-0 z-10 shadow-lg rounded-lg overflow-hidden">
                <div 
                  className="fixed inset-0 z-0"
                  onClick={() => setShowTextColorPicker(false)}
                />
                <div className="relative z-10">
                  <ChromePicker
                    color={textColor}
                    onChange={(color: any) => {
                      setTextColor(color.hex);
                      if (canvas && selectedObject && selectedObject.type === 'textbox') {
                        selectedObject.set('fill', color.hex);
                        canvas.renderAll();
                        saveToHistory();
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: isDarkMode ? '#9ca3af' : '#4b5563' }}>Background:</span>
          <div className="flex gap-2">
            <button 
              onClick={clearFrame} 
              className={`px-3 py-1.5 rounded flex items-center gap-1 ${isDarkMode ? 'bg-red-900/30 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
            >
              <FaTrash size={14} />
              <span>Clear Frame</span>
            </button>
          <div className="relative">
            <div 
                className={`w-8 h-8 rounded-full cursor-pointer border transition-transform hover:scale-110 ${isDarkMode ? 'border-[#444] shadow-lg' : 'border-gray-300 shadow-sm'}`}
              style={{ backgroundColor: backgroundColor }}
              onClick={applyRandomBackgroundColor}
            />
            <button 
                className={`absolute -top-1 -right-1 rounded-full p-1 shadow-sm ${isDarkMode ? 'bg-[#2D2D2D] border-[#444]' : 'bg-white border-gray-300'} border`}
              onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
            >
              <FaPalette size={8} />
            </button>
            {showBackgroundColorPicker && (
                <div className="absolute top-10 left-0 z-10 shadow-lg rounded-lg overflow-hidden">
                <div 
                  className="fixed inset-0 z-0"
                  onClick={() => setShowBackgroundColorPicker(false)}
                />
                  <div className="relative z-10" style={{ backgroundColor: isDarkMode ? '#1A1A1A' : 'white', padding: '8px', borderRadius: '8px' }}>
                  <ChromePicker
                    color={backgroundColor}
                    onChange={(color: any) => {
                        const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
                        updateBackgroundColor(rgbaColor);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div 
                className={`w-8 h-8 rounded-full cursor-pointer border transition-transform hover:scale-110 ${isDarkMode ? 'border-[#444] shadow-lg' : 'border-gray-300 shadow-sm'}`}
                style={{ 
                  background: gradientType !== 'none' 
                    ? `linear-gradient(45deg, ${gradientColors[0]}, ${gradientColors[1]})`
                    : 'transparent'
                }}
                onClick={() => {
                  const currentIndex = gradientPresets.findIndex(
                    preset => preset.type === gradientType && 
                    preset.colors[0] === gradientColors[0] && 
                    preset.colors[1] === gradientColors[1]
                  );
                  const nextIndex = (currentIndex + 1) % gradientPresets.length;
                  const nextPreset = gradientPresets[nextIndex];
                  setGradientType(nextPreset.type as 'linear' | 'radial');
                  setGradientColors(nextPreset.colors);
                  applyGradientBackground();
                }}
              />
              <button 
                className={`absolute -top-1 -right-1 rounded-full p-1 shadow-sm ${isDarkMode ? 'bg-[#2D2D2D] border-[#444]' : 'bg-white border-gray-300'} border`}
                onClick={() => setShowGradientSelector(!showGradientSelector)}
              >
                <FaPalette size={8} />
              </button>
              {showGradientSelector && (
                <div className="absolute top-10 left-0 z-10 shadow-lg">
                  <div 
                    className="fixed inset-0 z-0"
                    onClick={() => setShowGradientSelector(false)}
                  />
                  <div className="relative z-10 bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex gap-4 mb-4">
                      <div>
                        <label className="block text-sm mb-2">Start Color</label>
                        <ChromePicker
                          color={gradientColors[0]}
                          onChange={(color: any) => {
                            const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
                            updateGradientColors(rgbaColor, gradientColors[1]);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">End Color</label>
                        <ChromePicker
                          color={gradientColors[1]}
                          onChange={(color: any) => {
                            const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
                            updateGradientColors(gradientColors[0], rgbaColor);
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={applyGradientBackground}
                      className={`w-full py-2 px-3 rounded ${
                        isDarkMode
                          ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      }`}
                    >
                      Apply Gradient
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div 
                className={`w-8 h-8 rounded-full cursor-pointer border transition-transform hover:scale-110 flex items-center justify-center ${isDarkMode ? 'border-gray-600 shadow-lg bg-gray-800' : 'border-gray-300 shadow-sm bg-gray-100'}`}
                onClick={() => {
                  if (imagePresets.length > 0) {
                    const randomIndex = Math.floor(Math.random() * imagePresets.length);
                    applyImageBackground(imagePresets[randomIndex]);
                  }
                }}
              >
                <FaImage size={14} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
              </div>
              <button 
                className={`absolute -top-1 -right-1 rounded-full p-1 shadow-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border`}
                onClick={() => setShowImageSelector(!showImageSelector)}
              >
                <FaPalette size={8} />
              </button>
              {showImageSelector && (
                <div className="absolute top-10 left-0 z-10 shadow-lg">
                  <div 
                    className="fixed inset-0 z-0"
                    onClick={() => setShowImageSelector(false)}
                  />
                  <div className="relative z-10 bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <div className="w-64">
                      <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Select Image Background
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {imagePresets.map((imgUrl, index) => (
                          <div 
                            key={index}
                            className="aspect-video rounded overflow-hidden cursor-pointer hover:opacity-90 border border-gray-200 dark:border-gray-700"
                            onClick={() => {
                              applyImageBackground(imgUrl);
                              setShowImageSelector(false);
                            }}
                          >
                            <img 
                              src={imgUrl} 
                              alt={`Background ${index + 1}`} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full py-2 px-3 rounded text-sm ${
                            isDarkMode
                              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                          }`}
                        >
                          Upload Custom Image
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      <div className={`border rounded-xl overflow-hidden mb-4 ${isDarkMode ? 'border-[#333]' : 'border-gray-200'}`} style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <div style={{ 
          width: '100%', 
          position: 'relative',
          padding: '10px',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: isDarkMode ? '#121212' : '#f0f0f0'
        }}>
          <div style={{ 
            width: `${frameSize.width}px`, 
            height: `${frameSize.height}px`,
            maxWidth: '100%',
            maxHeight: '600px',
            transform: `scale(${Math.min(1, Math.min(800 / frameSize.width, 600 / frameSize.height))})`,
            transformOrigin: 'top left'
          }}>
            <canvas ref={canvasRef} />
          </div>
          <div className={`absolute bottom-0 right-0 p-2 ${isDarkMode ? 'bg-black' : 'bg-black'} bg-opacity-50 text-white text-xs rounded-tl`}>
            {frameSize.width} × {frameSize.height}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button 
          onClick={handleDownload} 
          className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-[#2D2D2D] hover:bg-[#3A3A3A] text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
        >
          Download
        </button>
        <button 
          onClick={() => {
            // When clicking save, if canvas exists, call onSave which will trigger authentication
            if (canvas) {
              onSave(canvas);
            }
          }}
          className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-green-600/20 hover:bg-green-600/30 text-green-500' : 'bg-green-500 hover:bg-green-600 text-white'}`}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default CanvasEditor; 
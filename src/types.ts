// Import fabric types
import { fabric } from 'fabric';

// We define our own interfaces without directly importing fabric to avoid module resolution issues
export interface Note {
  id: string;
  title: string;
  content: string;
  thumbnail: string;
  thumbnailPath?: string; // Path to the image in Supabase Storage
  created_at?: string; // Optional as it's handled by Supabase
  updated_at?: string; // Optional as it's handled by Supabase
  userid: string; // Changed from userId to match database schema
  canvasState: CanvasState | string | any; // Allow string for JSON or any for flexibility
  frameSize?: {
    name: string;
    width: number;
    height: number;
    category: string;
  };
}

export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface CanvasState {
  objects: any[];
  background: string;
  width: number;
  height: number;
}

export interface TextBox {
  id: string;
  type: 'heading' | 'subheading' | 'paragraph';
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface Font {
  family: string;
  category: string;
  variants: string[];
}

export interface Color {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  hsl: {
    h: number;
    s: number;
    l: number;
    a: number;
  };
}

// Define our own interface instead of using fabric's types directly
export interface SelectionEvent {
  selected: any[];
} 
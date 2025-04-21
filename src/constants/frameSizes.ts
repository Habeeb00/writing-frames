export interface FrameSize {
  name: string;
  width: number;
  height: number;
  category: string;
}

export const FRAME_SIZES: FrameSize[] = [
  // Social Media Stories
  {
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    category: 'Social Stories'
  },
  {
    name: 'Facebook Story',
    width: 1080,
    height: 1920,
    category: 'Social Stories'
  },
  {
    name: 'Snapchat Story',
    width: 1080,
    height: 1920,
    category: 'Social Stories'
  },
  
  // Social Media Posts
  {
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    category: 'Social Posts'
  },
  {
    name: 'Facebook Post',
    width: 1200,
    height: 630,
    category: 'Social Posts'
  },
  {
    name: 'Twitter Post',
    width: 1200,
    height: 675,
    category: 'Social Posts'
  },
  {
    name: 'LinkedIn Post',
    width: 1200,
    height: 627,
    category: 'Social Posts'
  },

  // Print Formats
  {
    name: 'A4 Portrait',
    width: 2480,
    height: 3508,
    category: 'Print'
  },
  {
    name: 'A4 Landscape',
    width: 3508,
    height: 2480,
    category: 'Print'
  },
  {
    name: 'US Letter',
    width: 2550,
    height: 3300,
    category: 'Print'
  },
  {
    name: 'Business Card',
    width: 1050,
    height: 600,
    category: 'Print'
  },

  // Presentation
  {
    name: 'Presentation 16:9',
    width: 1920,
    height: 1080,
    category: 'Presentation'
  },
  {
    name: 'Presentation 4:3',
    width: 1600,
    height: 1200,
    category: 'Presentation'
  },

  // Custom
  {
    name: 'Custom',
    width: 800,
    height: 600,
    category: 'Custom'
  }
];

// Default frame size for new canvases
export const DEFAULT_FRAME_SIZE: FrameSize = {
  name: 'Default',
  width: 800,
  height: 600,
  category: 'Custom'
}; 
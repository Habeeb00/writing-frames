const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running post-install script...');

// Create a tailwind.config.js file if it doesn't exist
const tailwindConfigPath = path.join(__dirname, '..', 'tailwind.config.js');
if (!fs.existsSync(tailwindConfigPath)) {
  console.log('Creating tailwind.config.js...');
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        danger: 'var(--danger-color)',
      },
    },
  },
  plugins: [],
}`;
  fs.writeFileSync(tailwindConfigPath, tailwindConfig);
  console.log('tailwind.config.js created successfully');
}

// Create a postcss.config.js file if it doesn't exist
const postcssConfigPath = path.join(__dirname, '..', 'postcss.config.js');
if (!fs.existsSync(postcssConfigPath)) {
  console.log('Creating postcss.config.js...');
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  fs.writeFileSync(postcssConfigPath, postcssConfig);
  console.log('postcss.config.js created successfully');
}

// Add import for Tailwind CSS to index.css if it doesn't exist
const cssPath = path.join(__dirname, '..', 'src', 'index.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  if (!cssContent.includes('@tailwind')) {
    console.log('Adding Tailwind CSS imports to index.css...');
    const tailwindImports = `@tailwind base;
@tailwind components;
@tailwind utilities;

${cssContent}`;
    fs.writeFileSync(cssPath, tailwindImports);
    console.log('Tailwind CSS imports added to index.css');
  }
}

// Create directory for scripts if it doesn't exist
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

console.log('Post-install script completed successfully!'); 
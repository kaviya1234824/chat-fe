import React, { useState, useEffect } from 'react';
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from '@codesandbox/sandpack-react';
import { nightOwl } from '@codesandbox/sandpack-themes';
import { LayoutGroup, motion } from 'framer-motion';

// Define an interface for the files object
interface SandpackFiles {
  [key: string]: string;
}

interface PreviewSectionProps {
  code: any;
}

const PreviewSection = ({ code }: PreviewSectionProps) => {
  const [files, setFiles] = useState<SandpackFiles>({
    '/App.jsx': `export default function App() {
  return (
    <div>
      <h1>Enter a prompt to generate code</h1>
    </div>
  );
}`,
    '/styles.css': `
.app {
  padding: 20px;
  text-align: center;
}`,
    '/index.jsx': `
import React from 'react';
import './styles.css';
import App from './App';

export default function Index() {
  return (
    <div className="app">
      <App />
    </div>
  );
}`
  });

  const [activeView, setActiveView] = useState<'code' | 'preview'>('code');

  // Effect to update files when code prop changes
  useEffect(() => { 
    if (code && typeof code === 'object') {
      // Create a new files object
      const newFiles: SandpackFiles = { ...files };

      // Map the backend response to Sandpack files
      Object.entries(code).forEach(([fileName, fileContent]) => {
        // Determine the appropriate file extension
        const normalizedFileName = fileName.includes('.')
          ? fileName 
          : (fileName.includes('html') 
              ? '/App.html' 
              : '/App.jsx');

        // Ensure fileContent is a string
        const content = typeof fileContent === 'string' 
          ? fileContent 
          : JSON.stringify(fileContent);

        // Update or add the file using type assertion
        newFiles[normalizedFileName as keyof SandpackFiles] = content;
      });

      // Update files state
      setFiles(newFiles);
    } else if (typeof code === 'string') {
      // If code is a string, update App.jsx
      setFiles(prev => ({
        ...prev,
        '/App.jsx': code
      }));
    }
  }, [code]);

  return (
    <div className="w-1/2 bg-gray-900 flex flex-col">
      {/* View Toggle */}
      <div className="p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex gap-2 bg-gray-900 p-1 rounded-lg w-fit">
          <LayoutGroup>
            {(['code', 'preview'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`relative px-4 py-1 rounded-md text-sm font-medium capitalize ${
                  activeView === view ? 'text-white' : 'text-gray-400'
                }`}
              >
                {activeView === view && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-gray-700 rounded-md"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                {view}
              </button>
            ))}
          </LayoutGroup>
        </div>
      </div>

      <SandpackProvider 
        theme={nightOwl}
        template="react"
        files={files}
        options={{
          recompileMode: "delayed",
          recompileDelay: 500,
          classes: {
            "sp-layout": "!bg-gray-900",
            "sp-file-explorer": "!bg-gray-900 !border-gray-700",
            "sp-tab-button": "!bg-gray-800",
          },
        }}
      >
        <div className="flex-1 flex h-screen overflow-hidden">
          <div className="w-48 border-r border-gray-700">
            <SandpackFileExplorer />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                activeView === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}>
                <SandpackCodeEditor 
                  showLineNumbers={true}
                  showInlineErrors={true}
                  wrapContent={true}
                  closableTabs={false}
                />
              </div>
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                activeView === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}>
                <SandpackPreview
                  showNavigator={true}
                  showRefreshButton={true}
                />
              </div>
            </div>
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
};

export default PreviewSection;
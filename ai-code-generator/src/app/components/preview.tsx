import React, { useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  FileTabs,
} from '@codesandbox/sandpack-react';
import { nightOwl } from '@codesandbox/sandpack-themes';
import { LayoutGroup, motion } from 'framer-motion';

interface PreviewSectionProps {
  code: string;
}

const PreviewSection = ({ code }: PreviewSectionProps) => {
  const [activeView, setActiveView] = useState<'code' | 'preview'>('code');
  
  const files = {
    '/App.jsx': code || `export default function App() {
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
  };

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
            {/* <div className="border-b border-gray-700"> */}
              {/* <FileTabs /> */}
            {/* </div> */}
            
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
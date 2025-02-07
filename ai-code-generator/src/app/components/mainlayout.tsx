'use client'
import React, { useState } from 'react';
import ChatSection from './chat';
import PreviewSection from './preview';

interface ProjectData {
  code: any; // Dynamic file/folder structure (JSON object)
  framework: string; // e.g., "react", "angular", etc.
}

const MainLayout = () => {
  const [project, setProject] = useState<ProjectData | null>(null);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">AI Code Generator</h1>
      </header>

      <div className="flex-1 flex">
        <ChatSection onCodeUpdate={setProject} />
        <PreviewSection data={project} />
      </div>
    </div>
  );
};

export default MainLayout;

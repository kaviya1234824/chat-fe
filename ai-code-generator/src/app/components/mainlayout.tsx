'use client'
import React,{useState} from 'react';
import ChatSection from './chat';
import PreviewSection from './preview';

const MainLayout = () => {
  const [currentCode, setCurrentCode] = useState('');
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">AI Code Generator</h1>
      </header>

      <div className="flex-1 flex">
        <ChatSection onCodeUpdate={setCurrentCode} />
        <PreviewSection data={currentCode} />
      </div>
    </div>
  );
};

export default MainLayout;
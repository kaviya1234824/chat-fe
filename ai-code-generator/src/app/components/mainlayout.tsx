'use client'
import React, { useState } from 'react';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import ChatSection, { Message } from './chat';
import PreviewSection from './preview';

interface ProjectData {
  code: any;
  framework: string;
}

const api = axios.create({ baseURL: 'http://localhost:3000/api/' });

const MainLayout = () => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSplitScreen, setShowSplitScreen] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.post('agent-model/generate', { prompt: input });
      if (response.data.success) {
        const responseData = response.data.data;
        const projectCode = responseData.code;
        const framework = responseData.framework || '';
        const otherResponse = responseData.otherResponse; // Fixed typo

        const msgs: Message[] = [
          { text: input, sender: 'user' },
          { text: otherResponse, sender: 'assistant' },
        ];
        setInitialMessages(msgs);
        setProject({ code: projectCode, framework });
        setShowSplitScreen(true);
      }
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="relative h-screen">
      {!showSplitScreen ? (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
          <h1 className="text-2xl font-bold">What do you want to build?</h1>
          <p className="text-gray-400 mt-2">
            Prompt, run, edit, and deploy full-stack web apps.
          </p>
          <div className="mt-6">
            <div className="relative w-[500px]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your prompt..."
                className="w-[500px] p-3 h-[150px] rounded-md bg-gray-900 border border-gray-700 text-white"
                disabled={isLoading}
              />
              {input.trim().length > 0 && (
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="absolute top-2 right-2 px-2 py-2 bg-blue-500 text-black rounded-md hover:bg-blue-600"
                >
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-screen flex flex-col overflow-hidden">
          <header className="bg-gray-800 text-white p-4">
            <h1 className="text-xl font-bold">AI Code Generator</h1>
          </header>
          <div className="flex-1 flex overflow-hidden">
            <ChatSection
              onCodeUpdate={setProject}
              initialMessages={initialMessages}
            />
            <PreviewSection data={project} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import ChatSection, { Message } from './chat';
import PreviewSection from './preview';
import { ShineBorder } from '@/components/magicui/shine-border';
import { useChatHistory } from '@/persistence/useChatHistory';

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
  // New state to control the loader overlay on the Sandpack module
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { saveMessage, getChatHistory } = useChatHistory();

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
  
    // Save user query
    const userMessage : Message= { text: input, sender: "user" };
    setInitialMessages((prev) => [...prev, userMessage]);
    await saveMessage(userMessage);  // Store user query in IndexedDB
  
    try {
      const response = await api.post("agent-model/generate", {
        prompt: input,
        imageURL: uploadedImage || undefined,
      });
  
      if (response.data.success) {
        const responseData = response.data.data;
        const systemMessage : Message = { text: responseData.otherResponse, sender: "assistant" };
  
        setInitialMessages((prev) => [...prev, systemMessage]);
        await saveMessage(systemMessage);  // Store system response in IndexedDB
  
        setProject({ code: responseData.code, framework: responseData.framework || "" });
        setShowSplitScreen(true);
      }
    } catch (error) {
      console.error("Error generating code:", error);
      const errorMessage : Message = { text: "Error generating code.", sender: "assistant" };
  
      setInitialMessages((prev) => [...prev, errorMessage]);
      await saveMessage(errorMessage);  // Store error message in IndexedDB
    } finally {
      setIsLoading(false);
      setInput("");
      setUploadedImage(null);
    }
  };
  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevents new line in textarea
      handleGenerate();
    }
  };
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getChatHistory();
      setInitialMessages(history);
    };
    loadHistory();
  }, []);
  

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
              <ShineBorder
              borderWidth={5}
              color={'#8D5B57'}
              >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your prompt..."
                className="w-[500px] p-3 h-[150px] rounded-md bg-gray-900 border border-gray-700 text-white"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
              />
              </ShineBorder>
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
          <div className="flex-1 flex overflow-hidden">
            {/* Pass down the loader state setter to ChatSection */}
            <ChatSection 
              onCodeUpdate={setProject} 
              initialMessages={initialMessages} 
              onLoadingChange={setIsGenerating} 
            />
            {/* Pass the current generation state to PreviewSection */}
            <PreviewSection data={project} isGenerating={isGenerating} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;

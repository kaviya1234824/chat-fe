'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { ArrowRight, Camera as CameraIcon, X } from 'lucide-react';
import ChatSection, { Message } from './chat';
import PreviewSection from './preview';
import { ShineBorder } from '@/components/magicui/shine-border';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      // Add the user's prompt and optionally the uploaded image to the chat
      const newMessage: Message = {
        text: input,
        sender: 'user',
        image: uploadedImage || undefined,
      };

      setInitialMessages((prev) => [...prev, newMessage]);

      const response = await api.post('agent-model/generate', {
        prompt: input,
        imageURl: uploadedImage || undefined,
      });

      if (response.data.success) {
        const responseData = response.data.data;
        const projectCode = responseData.code;
        const framework = responseData.framework || '';
        const otherResponse = responseData.otherResponse;

        // Add the assistant's response to the chat
        setInitialMessages((prev) => [
          ...prev,
          { text: otherResponse, sender: 'assistant' },
        ]);

        setProject({ code: projectCode, framework });
        setShowSplitScreen(true);
      }
    } catch (error) {
      console.error('Error generating code:', error);
      setInitialMessages((prev) => [
        ...prev,
        {
          text: "Sorry, there was an error generating the code. Please try again.",
          sender: 'assistant',
        },
      ]);
    } finally {
      setIsLoading(false);
      setInput('');
      setUploadedImage(null); // Clear the uploaded image after submission
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevents new line in textarea
      handleGenerate();
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
              <ShineBorder borderWidth={5} color={'#8D5B57'}>
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
            {/* Image Upload Section */}
            <div className="mt-4 flex items-center">
              <ImageUpload
                uploadedImage={uploadedImage}
                onUpload={(base64Image) => setUploadedImage(base64Image)}
                onRemove={() => setUploadedImage(null)}
              />
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
            <ChatSection
              onCodeUpdate={setProject}
              initialMessages={initialMessages}
              onLoadingChange={setIsGenerating}
            />
            <PreviewSection data={project} isGenerating={isGenerating} />
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Image Upload Component
interface ImageUploadProps {
  onUpload: (base64Image: string) => void;
  onRemove: () => void;
  uploadedImage: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, onRemove, uploadedImage }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const toBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };
      try {
        const base64Image = await toBase64(file);
        onUpload(base64Image);
      } catch (error) {
        console.error('Error processing image upload:', error);
      }
    }
  };

  return (
    <div className="flex items-center">
      {uploadedImage ? (
        <div className="relative">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="w-20 h-20 object-cover rounded-md"
          />
          <button
            onClick={onRemove}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <label htmlFor="image-upload" className="flex items-center cursor-pointer text-gray-400">
            <CameraIcon size={20} className="mr-2" />
            <span>Upload Reference Image(optional)</span>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};

export default MainLayout;
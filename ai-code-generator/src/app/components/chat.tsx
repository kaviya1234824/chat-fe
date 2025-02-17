import React, { useState } from 'react';
import axios from 'axios';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { CameraIcon, X } from 'lucide-react';

export interface Message {
  text: string;
  sender: 'user' | 'assistant';
  code?: string;
  image?: string;
}

interface ChatSectionProps {
  onCodeUpdate: (project: { code: any; framework: string } | null) => void;
  initialMessages?: Message[];
  onLoadingChange?: (loading: boolean) => void;
}

const api = axios.create({ baseURL: 'http://localhost:3000/api/' });

const ChatSection = ({ onCodeUpdate, initialMessages = [], onLoadingChange }: ChatSectionProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleNewChat = () => {
    setMessages([]);
    onCodeUpdate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsLoading(true);
      onLoadingChange && onLoadingChange(true);

      // Add the user's prompt and optionally the uploaded image to the chat
      setMessages((prev) => [
        ...prev,
        
      ]);

      try {
        // Send both the prompt and the optionally uploaded image
        const response = await api.post('agent-model/generate', {
          prompt: input,
          imageURl: uploadedImage || undefined,
        });
        if (response.data.success) {
          const responseData = response.data.data;
          const projectCode = responseData.code;
          const framework = responseData.framework || '';
          const otherResponse = responseData.otherResponse;

          setMessages((prev) => [
            ...prev,
            { text: otherResponse, sender: 'assistant' },
          ]);
          onCodeUpdate({ code: projectCode, framework });
        }
      } catch (error) {
        console.error('Error generating code:', error);
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, there was an error generating the code. Please try again.",
            sender: 'assistant',
          },
        ]);
      } finally {
        setIsLoading(false);
        onLoadingChange && onLoadingChange(false);
        setInput('');
        // Optionally clear the image after sending
        setUploadedImage(null);
      }
    }
  };

  return (
    <div className="w-1/2 flex flex-col border-r border-gray-700 bg-[#011627]">
      <div className="p-1.5 border-b border-gray-700 bg-[#1E2D3D] flex justify-between items-center">
        <h2 className="font-bold text-white">Chat</h2>
        <button
          onClick={handleNewChat}
          className="px-2 py-1 h-8 bg-[#673AB7] text-centre text-white text-sm rounded hover:bg-[#5D34A5] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          New Chat
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-[#010508]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-[#673AB7] text-white ml-auto max-w-sm'
                  : 'bg-[#1E2D3D] text-white max-w-full w-full'
              }`}
            >
              {/* Display the uploaded image */}
              {message.image && (
                <div className="relative mb-2">
                  <img
                    src={message.image}
                    alt="Uploaded"
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  {message.sender === 'user' && (
                    <button
                      onClick={() => {
                        // Remove the image from the messages
                        setMessages((prev) =>
                          prev.map((msg, i) =>
                            i === index ? { ...msg, image: undefined } : msg
                          )
                        );
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
              <div>
                <TypingAnimation>{message.text}</TypingAnimation>
              </div>
              {message.code && (
                <pre className="mt-2 p-2 bg-gray-800 text-white rounded overflow-x-auto">
                  <code>{message.code}</code>
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2 items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your prompt..."
            className="flex-1 p-2 h-10 scrollbar-hidden border text-white border-gray-600 bg-[#1E2D3D] rounded focus:outline-none focus:ring-2 focus:ring-[#5D34A5]"
            disabled={isLoading}
          />
          <label
            htmlFor="imageUpload"
            className="flex justify-centre w-10 text-sm bg-[#673AB7] text-white rounded cursor-pointer hover:bg-[#5D34A5]"
          >
            <CameraIcon className="ml-2 mr-2 h-10 w-6" />
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Convert image to base64
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
                  setMessages((prev) => [
                    ...prev,
                    {
                      text: 'Image uploaded. It will be used as a visual reference.',
                      sender: 'user',
                      image: base64Image,
                    },
                  ]);
                  // Store the image for later submission with the prompt
                  setUploadedImage(base64Image);
                } catch (error) {
                  console.error('Error processing image upload:', error);
                  setMessages((prev) => [
                    ...prev,
                    {
                      text: "Error uploading image. Please try again.",
                      sender: 'assistant',
                    },
                  ]);
                }
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 bg-[#673AB7] text-white rounded hover:bg-[#5D34A5] focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Generating...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSection;
import React, { useState } from 'react';
import axios from 'axios';

export interface Message {
  text: string;
  sender: 'user' | 'assistant';
  code?: string;
}

interface ChatSectionProps {
  onCodeUpdate: (project: { code: any; framework: string } | null) => void;
  initialMessages?: Message[];
}

const api = axios.create({ baseURL: 'http://localhost:3000/api/' });

const ChatSection = ({ onCodeUpdate , initialMessages=[]}: ChatSectionProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = () => {
    setMessages([]);
    onCodeUpdate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setIsLoading(true);

      setMessages((prev) => [...prev, { text: input, sender: 'user' }]);

      try {
        const response = await api.post('agent-model/generate', {
          prompt: input,
        });

        if (response.data.success) {
          const responseData = response.data.data;
          const projectCode = responseData.code; // JSON folder structure
          const framework = responseData.framework || '';
          const otherResponse = responseData.otherRespsonse

          setMessages((prev) => [
            ...prev,
            {
              text: otherResponse,
              sender: 'assistant',
            },
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
        setInput('');
      }
    }
  };

  return (
    <div className="w-1/2 flex flex-col border-r border-gray-200">
      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="font-bold">Chat</h2>
        <button
          onClick={handleNewChat}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          New Chat
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-black ml-auto max-w-sm'
                  : 'bg-gray-200 max-w-full w-full'
              }`}
            >
              <div>{message.text}</div>
              {message.code && (
                <pre className="mt-2 p-2 bg-gray-800 text-white rounded overflow-x-auto">
                  <code>{message.code}</code>
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your prompt..."
            className="flex-1 p-2 border text-black border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 ${
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

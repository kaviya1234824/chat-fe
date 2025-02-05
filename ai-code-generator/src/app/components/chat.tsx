import React, { useState } from 'react';
// import { Send } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
  code?: string;
}

interface ChatSectionProps {
  onCodeUpdate: (code: string) => void;
}

const ChatSection = ({ onCodeUpdate }: ChatSectionProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      // Simulate AI response with code
      setTimeout(() => {
        const sampleCode = `export default function App() {
  return (
    <div>
      <h1>Hello from Sandpack!</h1>
    </div>
  );
}`;
        
        setMessages(prev => [...prev, { 
          text: "Here's a sample component:", 
          sender: 'assistant',
          code: sampleCode
        }]);
        onCodeUpdate(sampleCode);
      }, 500);
      setInput('');
    }
  };

  return (
    <div className="w-1/2 flex flex-col border-r border-gray-200">
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.sender === 'user' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white ml-auto max-w-sm'
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
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
          >
            {/* <Send size={18} /> */}
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatSection;
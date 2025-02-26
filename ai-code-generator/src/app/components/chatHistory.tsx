import React from 'react';
import { X } from 'lucide-react';
import { Message } from './chat'; 

interface ChatHistoryItem {
  id: string;
  title: string;
  messages: Message[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatHistoryItem[];
  onSelectChat: (messages: Message[]) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, chatHistory, onSelectChat, onNewChat }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-80 bg-[#1E2D3D] text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="font-bold">Chat History</h2>
        <button onClick={onClose} className="text-white hover:text-gray-300">
          <X size={24} />
        </button>
      </div>
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full mb-4 px-4 py-2 bg-[#673AB7] text-white rounded hover:bg-[#5D34A5] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          New Chat
        </button>
        <ul className="space-y-2">
          {chatHistory.length === 0 ? (
            <li className="text-gray-400">No chat history yet</li>
          ) : (
            chatHistory.map((chat) => (
              <li
                key={chat.id}
                onClick={() => onSelectChat(chat.messages)}
                className="p-2 bg-[#2A3B4C] rounded cursor-pointer hover:bg-[#354A5F]"
              >
                {chat.title}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
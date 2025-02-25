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

const api = axios.create({ baseURL: 'http://localhost:8000/' });

const MainLayout = () => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSplitScreen, setShowSplitScreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Static prompts
  const staticPrompts = [
    
    
    "Build a full-stack e-commerce application using Next.js and Firebase. Include features like product listing, shopping cart, user authentication, and payment integration. The app should support real-time updates and have a clean, modern UI.",
    "Develop a personal portfolio website using Gatsby and GraphQL. The site should showcase your projects, skills, and experience. Include a blog section where you can write articles about web development trends and technologies."
  ];

  // Handle prompt click
  const handlePromptClick = (prompt: string) => {
    setInput(prompt); // Bind the prompt text to the input field
  };

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
      const response = await api.post('agent_model/generate', {
        prompt: input,
        imageURl: uploadedImage || undefined,
      });
    //   {
    //     "code": {
    //         "package.json": "{\n  \"name\": \"react-login-app\",\n  \"version\": \"1.0.0\",\n  \"private\": true,\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\",\n    \"react-scripts\": \"5.0.1\",\n    \"tailwindcss\": \"^3.2.0\"\n  },\n  \"scripts\": {\n    \"start\": \"react-scripts start\",\n    \"build\": \"react-scripts build\",\n    \"test\": \"react-scripts test\",\n    \"eject\": \"react-scripts eject\"\n  }\n}\n",
    //         "public": {
    //             "index.html": "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>React Login App</title>\n    <!-- Tailwind CSS CDN (for development purposes) -->\n    <script src=\"https://cdn.tailwindcss.com\"></script>\n  </head>\n  <body class=\"bg-gray-100\">\n    <div id=\"root\"></div>\n  </body>\n</html>\n"
    //         },
    //         "src": {
    //             "index.js": "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n",
    //             "App.js": "import React from 'react';\nimport Header from './components/Header';\nimport LoginForm from './components/LoginForm';\nimport Footer from './components/Footer';\n\nfunction App() {\n  return (\n    <div className=\"min-h-screen flex flex-col\">\n      <Header />\n      <main className=\"flex-grow container mx-auto px-4 py-8\">\n        <LoginForm />\n      </main>\n      <Footer />\n    </div>\n  );\n}\n\nexport default App;\n",
    //             "components": {
    //                 "Header.js": "import React from 'react';\n\nfunction Header() {\n  return (\n    <header className=\"bg-white shadow-md py-4 px-6 sticky top-0 z-10 flex items-center justify-between\">\n      {/* Logo */}\n      <img\n        src=\"https://cdn.pixabay.com/photo/2016/10/25/12/28/logo-1767470_1280.png\"\n        alt=\"Company Logo\"\n        className=\"h-12 w-auto object-contain\"\n      />\n\n      {/* Page Title */}\n      <h1 className=\"text-2xl font-semibold text-gray-800\">Welcome to Our Service</h1>\n\n      {/* Language Selector and Help Icon Container */}\n      <div className=\"flex items-center space-x-4\">\n        <select className=\"block w-full border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500\">\n          <option value=\"en\">English</option>\n          <option value=\"es\">Español</option>\n          <option value=\"fr\">Français</option>\n        </select>\n        <span className=\"inline-block text-gray-600 hover:text-gray-800 cursor-pointer\" title=\"Need Help?\">?\n        </span>\n      </div>\n    </header>\n  );\n}\n\nexport default Header;\n",
    //                 "LoginForm.js": "import React, { useState } from 'react';\n\nfunction LoginForm() {\n  const [email, setEmail] = useState(\"\");\n  const [password, setPassword] = useState(\"\");\n  const [rememberMe, setRememberMe] = useState(false);\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    // Implement login functionality here\n    console.log({ email, password, rememberMe });\n  };\n\n  return (\n    <div className=\"max-w-md mx-auto bg-white p-8 border border-gray-200 rounded shadow\">\n      <h2 className=\"text-xl font-bold text-gray-800 mb-6 text-center\">Log In</h2>\n      <form onSubmit={handleSubmit}>\n        <div className=\"mb-4\">\n          <label className=\"block text-gray-700 font-medium mb-2\" htmlFor=\"email\">\n            Email or Username\n          </label>\n          <input\n            id=\"email\"\n            type=\"email\"\n            placeholder=\"e.g., user@example.com\"\n            value={email}\n            onChange={(e) => setEmail(e.target.value)}\n            className=\"shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500\"\n            required\n          />\n        </div>\n        <div className=\"mb-4\">\n          <label className=\"block text-gray-700 font-medium mb-2\" htmlFor=\"password\">\n            Password\n          </label>\n          <input\n            id=\"password\"\n            type=\"password\"\n            placeholder=\"Enter your secure password\"\n            value={password}\n            onChange={(e) => setPassword(e.target.value)}\n            className=\"shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500\"\n            required\n          />\n        </div>\n        <div className=\"mb-4 flex items-center\">\n          <input\n            id=\"rememberMe\"\n            type=\"checkbox\"\n            checked={rememberMe}\n            onChange={(e) => setRememberMe(e.target.checked)}\n            className=\"form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500\"\n          />\n          <label htmlFor=\"rememberMe\" className=\"ml-2 text-gray-700\">\n            Remember me\n          </label>\n        </div>\n        <div className=\"mb-4\">\n          <button\n            type=\"submit\"\n            className=\"bg-blue-500 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full\"\n          >\n            Log In\n          </button>\n        </div>\n        <div className=\"flex justify-between text-sm\">\n          <a href=\"#\" className=\"text-blue-500 hover:underline hover:text-blue-700\">\n            Forgot password?\n          </a>\n          <a href=\"#\" className=\"text-blue-500 hover:underline hover:text-blue-700\">\n            Create an account\n          </a>\n        </div>\n      </form>\n    </div>\n  );\n}\n\nexport default LoginForm;\n",
    //                 "Footer.js": "import React from 'react';\n\nfunction Footer() {\n  return (\n    <footer className=\"bg-white border-t border-gray-200 py-4\">\n      <p className=\"text-gray-600 text-sm text-center\">\n        © 2023 Your Company Name. All rights reserved.\n      </p>\n    </footer>\n  );\n}\n\nexport default Footer;\n"
    //             }
    //         }
    //     },
    //     "otherResponse": "Created four React components: Header, LoginForm, Footer, and App. The Header contains a logo sourced from Pixabay, a welcoming page title, a functional language selector, and a help icon. The LoginForm features realistic input placeholders, a checkbox for remembering the user, and links for account recovery and sign-up. The Footer provides a simple copyright notice. All components were styled using Tailwind CSS classes to ensure a consistent, responsive, and accessible UI."
    // }
      if (response) {
        const projectCode = response.data.code;
        const framework = response.data.framework || '';
        const otherResponse = response.data.otherResponse;
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
      e.preventDefault();
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

          {/* Static Prompts Section */}
          <div className="mt-8 ml-36 w-[500px] space-y-4">
            <h2 className="mr-1 text-lg font-semibold text-gray-400">Example Prompts</h2>
            {staticPrompts.map((prompt, index) => (
              <div
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="relative group cursor-pointer"
              >
                {/* Styled Box */}
                <div className="p-3 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors max-w-[400px] overflow-hidden">
                  <p className="text-gray-300 text-sm truncate">{prompt}</p>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs p-2 rounded-md whitespace-normal max-w-[400px] z-10">
                  {prompt}
                </div>
              </div>
            ))}
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
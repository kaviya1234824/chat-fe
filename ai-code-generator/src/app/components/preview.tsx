import React, { useState, useEffect } from "react";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { LayoutGroup, motion } from "framer-motion";

// Define supported frameworks
const FRAMEWORK_OPTIONS: { label: string; value: SandpackPredefinedTemplate }[] = [
  { label: "React", value: "react" },
  { label: "React + TypeScript", value: "react-ts" },
  { label: "Vue", value: "vue" },
  { label: "Svelte", value: "svelte" },
  { label: "Vanilla JS", value: "vanilla" },
  { label: "Vanilla TS", value: "vanilla-ts" },
  { label: "Vite + React", value: "vite-react" },
  { label: "Vite + Vue", value: "vite-vue" },
];

interface SandpackFiles {
  [key: string]: string;
}

interface PreviewSectionProps {
  data: string; // API response containing code files
}

const extractCodeFiles = (data: string): SandpackFiles => {
  const files: SandpackFiles = {
    
  };

  // Match code blocks using regex
  const regex = /```(\w+)\n([\s\S]+?)\n```/g;
  let match;

  while ((match = regex.exec(data)) !== null) {
    const language = match[1]; // File type (jsx, ts, css, json, html, etc.)
    let content = match[2]; // Extracted code content

    let filename = "";

    // Determine filename based on the language
    switch (language) {
      case "jsx":
        filename = content.includes("ReactDOM") ? "/index.jsx" : "/App.jsx";
        break;
      case "tsx":
        filename = content.includes("ReactDOM") ? "/index.tsx" : "/App.tsx";
        break;
      case "js":
        filename = "/App.js";
        break;
      case "ts":
        filename = "/App.ts";
        break;
      case "css":
        filename = "/App.css";
        break;
      case "html":
        filename = "/index.html";
        break;
      case "json":
        filename = "/package.json";
        break;
      case "svelte":
        filename = "/App.svelte";
        break;
      case "vue":
        filename = "/App.vue";
        break;
      default:
        filename = `/unknown.${language}`;
    }

    if (filename) {
      files[filename] = content;
    }
  }

  return files;
};

const PreviewSection = ({ data }: PreviewSectionProps) => {
  const [files, setFiles] = useState<SandpackFiles>({});
  const [activeView, setActiveView] = useState<"code" | "preview">("code");
  const [template, setTemplate] = useState<SandpackPredefinedTemplate>("react");
  console.log("safdasdfas",data)

  useEffect(() => {
    if (data) {
      setFiles({ "/App.jsx": data }); // Update files with new code
    }
  }, [data]);

  return (
    <div className="w-full bg-gray-900 flex flex-col h-screen">
      {/* Framework Selector */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-white text-lg">Sandbox Editor</h2>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value as SandpackPredefinedTemplate)}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          {FRAMEWORK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sandpack Provider */}
      <SandpackProvider
        theme={nightOwl}
        template={template}
        files={files}
        options={{
          recompileMode: "delayed",
          recompileDelay: 500,
          classes: {
            "sp-layout": "!bg-gray-900",
            "sp-file-explorer": "!bg-gray-900 !border-gray-700",
            "sp-tab-button": "!bg-gray-800",
          },
        }}
      >
        {/* Editor & Preview Layout */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View Toggle */}
          <div className="p-2 bg-gray-800 border-b border-gray-700">
            <div className="flex gap-2 bg-gray-900 p-1 rounded-lg w-fit">
              <LayoutGroup>
                {(["code", "preview"] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`relative px-4 py-1 rounded-md text-sm font-medium capitalize ${
                      activeView === view ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {activeView === view && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-gray-700 rounded-md"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    {view}
                  </button>
                ))}
              </LayoutGroup>
            </div>
          </div>

          {/* Editor & Preview */}
          <div className="flex flex-1">
            <div className="w-48 border-r border-gray-700">
              <SandpackFileExplorer />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex-1 relative">
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    activeView === "code" ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <SandpackCodeEditor showLineNumbers={true} showInlineErrors={true} wrapContent={true} closableTabs={false} />
                </div>
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    activeView === "preview" ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <SandpackPreview showNavigator={true} showRefreshButton={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
};

export default PreviewSection;

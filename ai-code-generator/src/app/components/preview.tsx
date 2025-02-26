import React, { useState, useEffect, useRef } from "react";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackPredefinedTemplate,
  UnstyledOpenInCodeSandboxButton,
} from "@codesandbox/sandpack-react";
import { cyberpunk } from "@codesandbox/sandpack-themes";
import { LayoutGroup } from "framer-motion";
import JSZip from "jszip";
import { Download, Github } from "lucide-react";
import axios from "axios";

// List of allowed Sandpack templates
const allowedTemplates = [
  "react",
  "react-ts",
  "vue",
  "svelte",
  "vanilla",
  "vanilla-ts",
  "vite-react",
  "vite-vue",
];

// Type definitions for Sandpack files and project data
interface SandpackFiles {
  [key: string]: string;
}

interface ProjectData {
  code: any;
  framework: string;
}

interface PreviewSectionProps {
  data: ProjectData | null;
  isGenerating?: boolean;
}

// Utility to flatten nested file structures into Sandpack-compatible format
const flattenFiles = (files: any, prefix = ""): SandpackFiles => {
  let result: SandpackFiles = {};
  for (const key in files) {
    const value = files[key];
    const path = prefix ? `${prefix}/${key}` : `/${key}`;
    if (typeof value === "string") {
      result[path] = value;
    } else if (typeof value === "object" && value !== null) {
      result = { ...result, ...flattenFiles(value, path) };
    }
  }
  return result;
};

// Determine the entry file for Sandpack based on available files
const getEntryFile = (files: SandpackFiles, template: string): string => {
  const candidates = [
    "/index.js",
    "/index.tsx",
    "/src/index.js",
    "/src/index.tsx",
    "/App.js",
    "/App.tsx",
    "/src/App.js",
    "/src/App.tsx",
  ];
  for (const candidate of candidates) {
    if (files[candidate]) {
      return candidate;
    }
  }
  return template.includes("ts") ? "/index.tsx" : "/index.js";
};

const PreviewSection = ({ data, isGenerating }: PreviewSectionProps) => {
  const [files, setFiles] = useState<SandpackFiles>({});
  const [activeView, setActiveView] = useState<"code" | "preview">("preview"); // Preview shown by default
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState<number>(50); // Initial width percentage for resizable panels
  const draggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine the Sandpack template based on the provided framework
  const template =
    data && data.framework
      ? allowedTemplates.includes(data.framework.toLowerCase())
        ? (data.framework.toLowerCase() as SandpackPredefinedTemplate)
        : "react"
      : "react";

  // Process the provided code data into Sandpack files
  useEffect(() => {
    if (data && data.code) {
      const flattened = flattenFiles(data.code);
      const entryCandidates = [
        "/index.js",
        "/index.tsx",
        "/src/index.js",
        "/src/index.tsx",
      ];
      const hasEntry = entryCandidates.some((candidate) => flattened[candidate]);
      if (!hasEntry) {
        const defaultEntry = template.includes("ts") ? "/index.tsx" : "/index.js";
        flattened[defaultEntry] = template.includes("ts")
          ? `import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));`
          : `import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));`;
      }

      const appCandidates = ["/App.js", "/App.tsx", "/src/App.js", "/src/App.tsx"];
      const hasApp = appCandidates.some((candidate) => flattened[candidate]);
      if (!hasApp) {
        const defaultApp = template.includes("ts") ? "/App.tsx" : "/App.js";
        flattened[defaultApp] = `export default function App() {
  return <div>Hello, World!</div>;
}`;
      }

      if (!flattened["/public/index.html"]) {
        flattened["/public/index.html"] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
      }

      if (!flattened["/src/index.css"]) {
        flattened["/src/index.css"] = "/* default index css */";
      }

      setFiles(flattened);
    } else {
      setFiles({});
    }
  }, [data, template]);

  // Handle GitHub OAuth token from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setGithubToken(token);
      window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
    }
  }, []);

  // Set up event listeners for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;
        
        // Constrain width between 20% and 80%
        const newWidthPercent = Math.min(80, Math.max(20, (mouseX / containerWidth) * 100));
        setPanelWidth(newWidthPercent);
      }
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Start resizing on mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none"; // Prevent text selection during drag
  };

  // Download project files as a ZIP
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    for (const [path, content] of Object.entries(files)) {
      const zipPath = path.startsWith("/") ? path.slice(1) : path;
      zip.file(zipPath, content);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "project.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Initiate GitHub OAuth flow
  const connectWithGitHub = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID; // Ensure this is set in your environment
    const redirectUri = "http://localhost:3000/api/github/callback"; // Adjust based on your backend
    const scope = "repo";
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = url;
  };

  // Push files to GitHub
  const pushToGitHub = async () => {
    if (!githubToken) {
      alert("Please connect with GitHub first!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/github/push", // Adjust based on your backend
        {
          files,
          repoName: "generated-react-app",
          token: githubToken,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      setRepoUrl(response.data.url);
      alert(`Successfully pushed to ${response.data.url}`);
    } catch (error) {
      console.error("Error pushing to GitHub:", error);
      alert("Failed to push to GitHub");
    }
  };

  return (
    <div className="relative w-full bg-gray-900 flex flex-col h-screen" ref={containerRef}>
      <SandpackProvider
        key={JSON.stringify(files)}
        theme={cyberpunk}
        template={template}
        files={files}
        customSetup={{
          entry: getEntryFile(files, template),
          dependencies: {
            "lucide-react": "latest",
            recharts: "2.9.0",
            "react-router-dom": "5.3.0",
          },
        }}
        options={{
          autorun: true,
          autoReload: true,
          externalResources: [
            "https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css",
          ],
          classes: {
            "sp-layout": "!bg-gray-900",
            "sp-file-explorer": "!bg-gray-900 !border-gray-700",
            "sp-tab-button": "!bg-gray-800",
          },
        }}
      >
        {/* Toolbar with view toggle and action buttons */}
        <div className="p-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <LayoutGroup>
            {(["code", "preview"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`relative px-4 py-1 rounded-md text-sm font-medium capitalize ${
                  activeView === view ? "text-white" : "text-gray-400"
                }`}
              >
                {view}
              </button>
            ))}
          </LayoutGroup>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isGenerating || Object.keys(files).length === 0}
              className={`relative px-4 py-1 rounded-md text-sm font-medium flex items-center ${
                isGenerating || Object.keys(files).length === 0
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Zip
            </button>
            {!githubToken ? (
              <button
                onClick={connectWithGitHub}
                className="relative px-4 py-1 rounded-md text-sm font-medium flex items-center text-gray-400 hover:text-white"
              >
                <Github className="w-4 h-4 mr-2" />
                Connect with GitHub
              </button>
            ) : (
              <button
                onClick={pushToGitHub}
                disabled={isGenerating || Object.keys(files).length === 0}
                className={`relative px-4 py-1 rounded-md text-sm font-medium flex items-center ${
                  isGenerating || Object.keys(files).length === 0
                    ? "text-gray-600 cursor-not-allowed"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Github className="w-4 h-4 mr-2" />
                Push to GitHub
              </button>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex h-screen overflow-hidden">
          {activeView === "preview" ? (
            <SandpackPreview
              style={{
                height: "100vh",
                backgroundColor: "white",
                width: "100%",
              }}
              showNavigator={true}
              showRefreshButton={true}
            />
          ) : (
            <div className="flex w-full">
              {/* Code editor panel */}
              <div style={{ width: `${panelWidth}%` }} className="flex h-full">
                <div className="w-48 border-r border-gray-300">
                  <SandpackFileExplorer style={{ height: "90vh" }} />
                </div>
                <div className="flex-1">
                  <SandpackCodeEditor
                    showLineNumbers={true}
                    showInlineErrors={true}
                    showTabs={false}
                    readOnly={false}
                    closableTabs={true}
                    style={{ height: "90vh" }}
                  />
                </div>
              </div>

              {/* Resizable handle */}
              <div
                className="cursor-col-resize w-2 bg-gray-700 hover:bg-purple-500 transition-colors duration-150 flex justify-center items-center z-10"
                onMouseDown={handleMouseDown}
                onMouseLeave={() => {
                  if (draggingRef.current) {
                    draggingRef.current = false;
                    document.body.style.cursor = "default";
                    document.body.style.userSelect = "auto";
                  }
                }}
              >
                <div className="h-8 w-0.5 bg-gray-500"></div>
              </div>

              {/* Preview panel */}
              <div style={{ width: `${100 - panelWidth}%` }} className="h-full">
                <SandpackPreview
                  style={{
                    height: "90vh",
                    backgroundColor: "white",
                    width: "100%",
                  }}
                  showNavigator={true}
                  showRefreshButton={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
            <div className="text-white text-xl font-normal">
              Generating response...
            </div>
          </div>
        )}

        <UnstyledOpenInCodeSandboxButton>
          Open in CodeSandbox
        </UnstyledOpenInCodeSandboxButton>
      </SandpackProvider>

      {/* GitHub repo link */}
      {repoUrl && (
        <div className="p-2 bg-gray-800 text-white text-sm">
          Pushed to:{" "}
          <a href={repoUrl} target="_blank" rel="noopener noreferrer">
            {repoUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default PreviewSection;
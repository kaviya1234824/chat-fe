import React, { useState, useEffect } from "react";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { LayoutGroup } from "framer-motion";

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

interface SandpackFiles {
  [key: string]: string;
}

interface ProjectData {
  code: any;
  framework: string;
}

interface PreviewSectionProps {
  data: ProjectData | null;
  // New optional prop to indicate if code generation is in progress
  isGenerating?: boolean;
}

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
  const [activeView, setActiveView] = useState<"code" | "preview">("code");

  const template =
    data && data.framework
      ? allowedTemplates.includes(data.framework.toLowerCase())
        ? (data.framework.toLowerCase() as SandpackPredefinedTemplate)
        : "react"
      : "react";

  useEffect(() => {
    if (data && data.code) {
      const flattened = flattenFiles(data.code);
      console.log("Flattened files:", flattened);

      const entryCandidates = [
        "/index.js",
        "/index.tsx",
        "/src/index.js",
        "/src/index.tsx",
      ];
      const hasEntry = entryCandidates.some(
        (candidate) => flattened[candidate]
      );
      if (!hasEntry) {
        const defaultEntry = template.includes("ts")
          ? "/index.tsx"
          : "/index.js";
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

      const appCandidates = [
        "/App.js",
        "/App.tsx",
        "/src/App.js",
        "/src/App.tsx",
      ];
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

  return (
    <div className="relative w-full bg-gray-900 flex flex-col h-screen">
      <SandpackProvider
        key={JSON.stringify(files)}
        theme={nightOwl}
        template={template}
        files={files}
        customSetup={{ entry: getEntryFile(files, template) }}
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
        <div className="p-2 bg-gray-800 border-b border-gray-700">
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
        </div>

        <div className="flex-1 flex h-screen overflow-hidden">
          {activeView === "code" ? (
            <div className="flex w-full">
              <div className="w-48 border-r border-gray-700">
                <SandpackFileExplorer 
                style={{ height: "90vh" }} />
              </div>
              <div className="flex-1">
                <SandpackCodeEditor
                  showLineNumbers={true}
                  showInlineErrors={true}
                  wrapContent={true}
                  closableTabs={false}
                  style={{ height: "90vh" }}
                />
              </div>
            </div>
          ) : (
            <SandpackPreview
              style={{
                height: "100vh",
                backgroundColor: "white",
                width: "100%",
              }}
              showNavigator={true}
              showRefreshButton={true}
            />
          )}
        </div>
        {/* {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
          </div>
        )} */}

{isGenerating && (
<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-lg z-50"> 
  <div className="text-white text-3xl font-extrabold"> Generating response... </div> </div> )}
      </SandpackProvider>
    </div>
  );
};

export default PreviewSection;

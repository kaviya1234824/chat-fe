import React, { useState, useEffect } from "react";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackPredefinedTemplate,
  UnstyledOpenInCodeSandboxButton,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { LayoutGroup } from "framer-motion";
import * as shadcnComponents from "@/lib/shadcn";
import  dedent from "dedent"
import Editor from './editor';

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

  const CustomPreview = () => {
    const { listen } = useSandpack();
    
    useEffect(() => {
      const unsubscribe = listen((msg) => {
        if (msg.type === "start") {
          setTimeout(() => {
            const preview = document.querySelector('.sp-preview-iframe') as HTMLIFrameElement;
            if (preview) {
              preview.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
              preview.style.width = '100%';
              preview.style.height = '100%';
              preview.style.border = 'none';
            }
          }, 1000);
        }
      });

      return () => unsubscribe();
    }, [listen]);

    return (
      <div className="w-full h-full">
        <SandpackPreview
          style={{
            height: '100%',
            width: '100%',
            border: 'none',
            margin: 0,
            padding: 0,
            overflow: 'hidden'
          }}
          showNavigator={false}
          showRefreshButton={false}
        />
      </div>
    );
  };

  return (
    <Editor activeView={activeView}>
      <div className="relative w-full bg-gray-900 flex flex-col h-screen">
        <SandpackProvider
          key={JSON.stringify(files)}
          theme={nightOwl}
          template={template}
          files={files}
          customSetup={{ entry: getEntryFile(files, template),

            dependencies: {
              // "lucide-react": "latest",
              recharts: "2.9.0",
              "react-router-dom": "5.3.0",
           

            },

           }}
          options={{
            // recompileMode: "delayed",
            // recompileDelay: 500,
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
            // useQueryString: true,
            // allowRunOnPreview: true,
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
                  <SandpackFileExplorer style={{ height: "90vh" }} />
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
              <div className="w-full h-full relative">
                <CustomPreview />
              </div>
            )}
          </div>
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


      </div>
    </Editor>
  );
};

export default PreviewSection;




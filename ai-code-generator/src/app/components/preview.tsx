import React, { useState, useEffect, useRef } from "react";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackPredefinedTemplate,
  UnstyledOpenInCodeSandboxButton,
  useSandpack,
  SandpackConsole,
  SandpackLayout,
  useSandpackClient,
} from "@codesandbox/sandpack-react";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { LayoutGroup } from "framer-motion";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import * as shadcnComponents from "@/lib/shadcn";
import dedent from "dedent";
import Editor from "./editor";

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
interface CustomPreviewProps {
  previewIframeRef: React.MutableRefObject<HTMLIFrameElement | null>;
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
  return candidates.find((candidate) => files[candidate]) || (template.includes("ts") ? "/index.tsx" : "/index.js");
};

const CustomPreview: React.FC<CustomPreviewProps> = ({ previewIframeRef }) => {
  const { iframe, listen } = useSandpackClient();


  useEffect(() => {
    if (iframe.current) {
      previewIframeRef.current = iframe.current;
      console.log("Sandbox iframe assigned to ref:", previewIframeRef.current);
      iframe.current.setAttribute(
        "sandbox",
        "allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-pointer-lock"
      );
      iframe.current.style.width = "100%";
      iframe.current.style.height = "100%";
      iframe.current.style.border = "none";
    }

    const unsubscribe = listen((message) => {
      if (message.type === "resize" && message.height && iframe.current) {
        if (iframe.current) {
          iframe.current.style.height = `${message.height}px`;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [iframe, listen, previewIframeRef]);

  return (
    <div className="w-full h-full">
            {/* <SandpackLayout> */}
      <SandpackPreview
        style={{
          height: "100%",
          width: "100%",
          border: "none",
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
        showNavigator={true}
        showRefreshButton={true}
      />
       {/* <SandpackConsole 
       showHeader= {true}
       showResetConsoleButton= {true}
       showRestartButton={true}/>
       </SandpackLayout> */}
    </div>
  );
};

const PreviewSection = ({ data, isGenerating }: PreviewSectionProps) => {
  const [files, setFiles] = useState<SandpackFiles>({});
  const [activeView, setActiveView] = useState<"code" | "preview">("code");
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);

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

  return (
    <Editor activeView={activeView} sandboxRef={previewIframeRef}>
      <div className="relative w-full bg-gray-900 flex flex-col h-screen">
        <SandpackProvider
          key={JSON.stringify(files)}
          theme={nightOwl}
          template={template}
          files={files}
          customSetup={{
            entry: getEntryFile(files, template),
            dependencies: {
              recharts: "2.9.0",
              "react-router-dom": "5.3.0",
            },
          }}
          options={{
            autorun: true,
            autoReload: true,
            initMode: "immediate",
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
                    extensions={[autocompletion()]}
                    extensionsKeymap={[...completionKeymap]}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative">
                <CustomPreview previewIframeRef={previewIframeRef} />
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
          {/* <SandpackCodeEditor extensions={[autocompletion()]} /> */}
          <UnstyledOpenInCodeSandboxButton>Open in CodeSandbox</UnstyledOpenInCodeSandboxButton>
        </SandpackProvider>
      </div>
    </Editor>
  );
};

export default PreviewSection;

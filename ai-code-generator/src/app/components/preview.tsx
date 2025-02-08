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
}

/**
 * Recursively flattens a nested file structure.
 * Example:
 * {
 *   "package.json": "content",
 *   "src": { "App.jsx": "content" }
 * }
 * becomes:
 * {
 *   "package.json": "content",
 *   "src/App.jsx": "content"
 * }
 */
const flattenFiles = (files: any, prefix = ""): SandpackFiles => {
  let result: SandpackFiles = {};
  for (const key in files) {
    const value = files[key];
    const path = prefix ? `${prefix}/${key}` : key;
    if (typeof value === "string") {
      result[path] = value;
    } else if (typeof value === "object" && value !== null) {
      result = { ...result, ...flattenFiles(value, path) };
    }
  }
  return result;
};

const PreviewSection = ({ data }: PreviewSectionProps) => {
  const [files, setFiles] = useState<SandpackFiles>({});
  const [activeView, setActiveView] = useState<"code" | "preview">("code");

  const template =
    data && data.framework
      ? allowedTemplates.includes(data.framework.toLowerCase())
        ? (data.framework.toLowerCase() as SandpackPredefinedTemplate)
        : "vanilla"
      : "react";

  useEffect(() => {
    if (data && data.code) {
      const flattened = flattenFiles(data.code);
      setFiles(flattened);
    } else {
      setFiles({});
    }
  }, [data]);

  return (
    <div className="w-full bg-gray-900 flex flex-col h-screen">
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-white text-lg">Code</h2>
        {data && data.framework && (
          <span className="text-gray-300 capitalize">
            Framework: {data.framework}
          </span>
        )}
      </div>

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
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
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

          <div className="flex flex-1">
            <div className="w-48 border-r border-gray-700">
              <SandpackFileExplorer />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 relative min-h-0">
                <ViewPanels activeView={activeView} />
              </div>
            </div>
          </div>
        </div>
      </SandpackProvider>
    </div>
  );
};

interface ViewPanelsProps {
  activeView: "code" | "preview";
}
const ViewPanels = ({ activeView }: ViewPanelsProps) => {
  return (
    <>
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          activeView === "code" ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
      >
        <SandpackCodeEditor
          // style={{ height: "100%" }} 
          showLineNumbers={true}
          showInlineErrors={true}
          wrapContent={true}
          closableTabs={false}
        />
      </div>
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          activeView === "preview" ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
      >
        <SandpackPreview 
        style={{ height: "90%" }}
        showNavigator={true} showRefreshButton={true} />
      </div>
    </>
  );
};

export default PreviewSection;

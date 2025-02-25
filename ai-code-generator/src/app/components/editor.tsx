import React, { useState, useEffect } from 'react';
import { EyeOff, Eye } from 'lucide-react';

interface ElementStyle {
  margin?: string;
  padding?: string;
  background?: string;
  borderRadius?: string;
}

interface EditorProps {
  activeView?: 'code' | 'preview';
  sandboxRef?: React.MutableRefObject<HTMLIFrameElement | null>;
  children: React.ReactNode;
}

const Editor: React.FC<EditorProps> = ({ children, activeView, sandboxRef }) => {
  const [inspectMode, setInspectMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<ElementStyle | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleInspectToggle = () => {
    setInspectMode(prev => !prev);
    console.log(`Inspect mode ${!inspectMode ? 'enabled' : 'disabled'}`);
  };

  const handleInspect = (e: MouseEvent) => {
    if (!inspectMode) return;
    e.preventDefault();
    e.stopPropagation();

    // Get the iframe window and document
    const iframe = sandboxRef?.current;
    if (!iframe?.contentWindow || !iframe?.contentDocument) {
      console.error('No iframe access');
      return;
    }
    
    // Check if the iframe sandbox includes allow-same-origin
    const sandboxAttr = iframe.getAttribute('sandbox') || '';
    if (!sandboxAttr.includes('allow-same-origin')) {
      console.error('Iframe sandbox missing "allow-same-origin" flag. Cannot inspect content.');
      return;
    }

    const target = e.target as HTMLElement;
    if (
      !target ||
      target === iframe.contentDocument.documentElement ||
      target === iframe.contentDocument.body
    ) {
      return;
    }

    setSelectedElement(target);
    const computedStyle = iframe.contentWindow.getComputedStyle(target);
    setSelectedStyles({
      margin: computedStyle.margin,
      padding: computedStyle.padding,
      background: computedStyle.backgroundColor,
      borderRadius: computedStyle.borderRadius,
    });
  };

  // Wait for the iframe to load, then inject default styles.
  useEffect(() => {
    const iframe = sandboxRef?.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log('Iframe loaded');
      setIframeLoaded(true);

      // Inject base styles into the iframe document.
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        const style = iframeDoc.createElement('style');
        style.textContent = `
          * {
            cursor: default;
          }
          *:hover {
            outline: 2px solid #60A5FA !important;
            outline-offset: -1px !important;
          }
        `;
        iframeDoc.head.appendChild(style);
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [sandboxRef]);

  // Set up inspection listeners when inspect mode is enabled.
  useEffect(() => {
    if (!inspectMode || activeView !== 'preview' || !iframeLoaded) return;

    const iframe = sandboxRef?.current;
    if (!iframe?.contentDocument) {
      console.error('No iframe document available');
      return;
    }

    const handleClick = (e: MouseEvent) => handleInspect(e);
    // Attach the click listener on the iframe document.
    iframe.contentDocument.addEventListener('click', handleClick, true);

    return () => {
      if (iframe.contentDocument) {
        iframe.contentDocument.removeEventListener('click', handleClick, true);
      }
    };
  }, [inspectMode, activeView, iframeLoaded, sandboxRef]);

  // Clear selected element on Escape key press.
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setSelectedStyles(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const updateElementStyle = (property: string, value: string) => {
    if (!selectedElement) return;
    
    selectedElement.style[property as any] = value;
    setSelectedStyles(prev => prev ? { ...prev, [property]: value } : null);
  };

  // Inject hover styles when inspect mode is active.
  useEffect(() => {
    const iframe = sandboxRef?.current;
    if (!iframe?.contentDocument) return;

    const existingStyle = iframe.contentDocument.querySelector('#inspect-styles');
    if (inspectMode && !existingStyle) {
      const newStyle = iframe.contentDocument.createElement('style');
      newStyle.id = 'inspect-styles';
      newStyle.textContent = `
        * {
          cursor: pointer !important;
        }
        *:hover {
          outline: 2px solid #60A5FA !important;
          outline-offset: -1px !important;
        }
      `;
      iframe.contentDocument.head.appendChild(newStyle);
    } else if (!inspectMode && existingStyle) {
      existingStyle.remove();
    }
  }, [inspectMode, sandboxRef]);

  return (
    <div className="w-full h-full flex flex-col">
      {activeView === 'preview' && (
        <div className="bg-gray-100 p-2 flex items-center gap-1.5 border-b border-gray-200">
          <button
            onClick={handleInspectToggle}
            className={`p-2 rounded transition-colors ${
              inspectMode 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-200 text-gray-600'
            }`}
            title={inspectMode ? 'Disable inspect mode' : 'Enable inspect mode'}
          >
            {inspectMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      )}

      <div className="flex-1 relative">
        {children}
      </div>

      {selectedElement && selectedStyles && (
        <div className="fixed right-0 top-0 w-64 h-full bg-white border-l border-gray-200 p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-700">Element Properties</h3>
            <button
              onClick={() => {
                setSelectedElement(null);
                setSelectedStyles(null);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          {Object.entries(selectedStyles).map(([property, value]) => (
            <div key={property} className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {property}
              </label>
              <input
                type="text"
                value={value || ''}
                onChange={(e) => updateElementStyle(property, e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Editor;

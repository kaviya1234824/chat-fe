import React, { useState, useEffect } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import PropertyPanel from './propertypanel';

interface ElementStyle {
  margin?: string;
  padding?: string;
  background?: string;
  borderRadius?: string;
}

interface EditorProps extends React.PropsWithChildren {
  activeView?: 'code' | 'preview';
}

const Editor: React.FC<EditorProps> = ({ children, activeView }) => {
  const [inspectMode, setInspectMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<ElementStyle | null>(null);

  const handleInspect = (e: MouseEvent) => {
    if (!inspectMode) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    setSelectedElement(target);
    const computedStyle = window.getComputedStyle(target);
    setSelectedStyles({
      margin: computedStyle.margin,
      padding: computedStyle.padding,
      background: computedStyle.backgroundColor,
      borderRadius: computedStyle.borderRadius,
    });
  };

  useEffect(() => {
    if (!inspectMode || activeView !== 'preview') return;

    const setupInspection = () => {
      const preview = document.querySelector('.sp-preview-iframe') as HTMLIFrameElement;
      if (preview?.contentDocument) {
        preview.contentDocument.addEventListener('click', handleInspect);
        
        // Add styles to preview document
        const style = preview.contentDocument.createElement('style');
        style.textContent = `
          * { cursor: pointer !important; }
          *:hover { outline: 2px solid rgba(59, 130, 246, 0.5) !important; }
        `;
        preview.contentDocument.head.appendChild(style);
        return () => {
          if (preview.contentDocument) {
            preview.contentDocument.removeEventListener('click', handleInspect);
          }
          style.remove();
        };
      }
    };

    // Wait for iframe to load
    const interval = setInterval(() => {
      const preview = document.querySelector('.sp-preview-iframe') as HTMLIFrameElement;
      if (preview?.contentDocument) {
        clearInterval(interval);
        setupInspection();
      }
    }, 100);

    return () => {
      clearInterval(interval);
      const preview = document.querySelector('.sp-preview-iframe') as HTMLIFrameElement;
      if (preview?.contentDocument) {
        preview.contentDocument.removeEventListener('click', handleInspect);
      }
    };
  }, [inspectMode, activeView]);

  const updateElementStyle = (property: string, value: string) => {
    if (selectedElement) {
      selectedElement.style[property as any] = value;
      setSelectedStyles(prev => prev ? {...prev, [property]: value} : null);
    }
  };

  return (
    <div className="editor-container">
      {activeView === 'preview' && (
        <div className="toolbar">
          <button 
            onClick={() => setInspectMode(!inspectMode)}
            className={`p-2 rounded ${inspectMode ? 'bg-primary/20' : 'hover:bg-primary/10'}`}
          >
            {inspectMode ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      <div className="relative flex-1">
        {children}

        {inspectMode && activeView === 'preview' && (
          <div className="inspector-overlay">
            {selectedElement && (
              <div 
                className="inspector-highlight"
                style={{
                  left: selectedElement.offsetLeft,
                  top: selectedElement.offsetTop,
                  width: selectedElement.offsetWidth,
                  height: selectedElement.offsetHeight,
                }}
              />
            )}
          </div>
        )}
      </div>

      {selectedElement && selectedStyles && (
        <PropertyPanel
          styles={selectedStyles}
          onUpdate={updateElementStyle}
          onClose={() => {
            setSelectedElement(null);
            setSelectedStyles(null);
          }}
        />
      )}
    </div>
  );
};

export default Editor;
          
        
        

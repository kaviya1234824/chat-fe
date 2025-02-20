import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
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
  sandboxRef?: MutableRefObject<HTMLIFrameElement | null>;
}

const Editor: React.FC<EditorProps> = ({ 
  children, 
  activeView, 
  sandboxRef
}) => {
  const [inspectMode, setInspectMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<ElementStyle | null>(null);

  const handleEditMode = () => {
    setInspectMode(prev => !prev);
    console.log(`Inspect mode ${!inspectMode ? 'enabled' : 'disabled'}`);
  };

  const handleInspect = (e: MouseEvent) => {
    if (!inspectMode) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (target !== document.documentElement && target !== document.body) {
      setSelectedElement(target);
      const computedStyle = window.getComputedStyle(target);
      const newStyles: ElementStyle = {
        margin: computedStyle.margin,
        padding: computedStyle.padding,
        background: computedStyle.backgroundColor,
        borderRadius: computedStyle.borderRadius,
      };
      setSelectedStyles(newStyles);
    }
  };

  useEffect(() => {
    if (!inspectMode || activeView !== 'preview') return;

    const iframe = sandboxRef?.current;
    if (!iframe) {
      console.log('Sandbox ref is not available yet, waiting...');
      return;
    }

    const attachListener = () => {
      const iframeDocument = iframe.contentDocument;
      if (!iframeDocument) {
        console.log('Iframe contentDocument is still not available.');
        return;
      }

      console.log('Attaching click listener to iframe document');
      const handleClick = (e: MouseEvent) => {
        console.log('Click event captured inside iframe');
        handleInspect(e);
      };

      iframeDocument.addEventListener('click', handleClick, true);

      return () => {
        console.log('Removing click listener from iframe document');
        iframeDocument.removeEventListener('click', handleClick, true);
      };
    };

    if (iframe.contentDocument) {
      const cleanupListener = attachListener();
      return () => {
        if (cleanupListener) cleanupListener();
      };
    }

    iframe.addEventListener('load', () => {
      console.log('Iframe loaded, attaching listeners...');
      attachListener();
    });

    return () => {
      iframe.removeEventListener('load', attachListener);
    };
  }, [inspectMode, activeView, sandboxRef]);

  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setSelectedStyles(null);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const updateElementStyle = (property: string, value: string) => {
    if (selectedElement) {
      selectedElement.style[property as any] = value;
      setSelectedStyles(prev => ({ ...prev, [property]: value }));
      console.log(`Updated ${property} to ${value} on element:`, selectedElement);
    }
  };

  return (
    <div className="editor-container">
      {activeView === 'preview' && (
        <div className="toolbar">
          <button 
            onClick={handleEditMode}
            className={`p-2 rounded ${inspectMode ? 'bg-primary/20' : 'hover:bg-primary/10'}`}
          >
            {inspectMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      )}

      <div className="relative flex-1">
        {children}
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

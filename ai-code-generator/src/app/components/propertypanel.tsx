import React from 'react';
import { X } from 'lucide-react';

interface PropertyPanelProps {
  styles: {
    margin?: string;
    padding?: string;
    background?: string;
    borderRadius?: string;
  };
  onUpdate: (property: string, value: string) => void;
  onClose: () => void;
}

const PropertyPanel = ({styles, onUpdate, onClose}: PropertyPanelProps) => {
  return(
    <div className="property-panel">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Styles</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="property-group">
        <label className="property-label">Margin</label>
        <input
          type="text"
          className="property-input"
          value={styles.margin || ''}
          onChange={(e) => onUpdate('margin', e.target.value)}
        />
      </div>

      <div className="property-group">
        <label className="property-label">Padding</label>
        <input
          type="text"
          className="property-input"
          value={styles.padding || ''}
          onChange={(e) => onUpdate('padding', e.target.value)}
        />
      </div>

      <div className="property-group">
        <label className="property-label">Background</label>
        <input
          type="text"
          className="property-input"
          value={styles.background || ''} 
          onChange={(e) => onUpdate('background', e.target.value)}
        />
      </div>

      <div className="property-group">
        <label className="property-label">Border Radius</label>
        <input
          type="text"
          className="property-input"
          value={styles.borderRadius || ''}
          onChange={(e) => onUpdate('borderRadius', e.target.value)}
        />
      </div>
    </div>
  );
};

export default PropertyPanel;
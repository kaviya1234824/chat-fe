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

const PropertyPanel = ({ styles, onUpdate, onClose }: PropertyPanelProps) => {
  return (
    <div className="property-panel">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Styles</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {Object.keys(styles).map((property) => (
        <div key={property} className="property-group">
          <label className="property-label">{property.replace(/([A-Z])/g, ' $1').trim()}</label>
          <input
            type="text"
            className="property-input"
            value={styles[property as keyof typeof styles] ?? ''}
            onChange={(e) => onUpdate(property as keyof typeof styles, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default PropertyPanel;
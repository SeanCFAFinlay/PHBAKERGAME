import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import './AssetInspector.css';

export const AssetInspector: React.FC = () => {
  const { selectedAsset, overrides, updateOverride } = useEditorStore();
  
  const [localOverride, setLocalOverride] = useState(
    selectedAsset ? overrides[selectedAsset.id] || {} : {}
  );

  React.useEffect(() => {
    if (selectedAsset) {
      setLocalOverride(overrides[selectedAsset.id] || {});
    }
  }, [selectedAsset, overrides]);

  if (!selectedAsset) {
    return (
      <div className="asset-inspector">
        <div className="empty-state">
          <p>Select an asset to edit</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (selectedAsset) {
      updateOverride(selectedAsset.id, localOverride);
    }
  };

  const handleChange = (path: string, value: unknown) => {
    setLocalOverride((prev) => {
      const newOverride = { ...prev };
      const keys = path.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newOverride;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newOverride;
    });
  };

  return (
    <div className="asset-inspector">
      <h2>Asset Inspector</h2>
      <div className="inspector-content">
        <div className="inspector-section">
          <h3>{selectedAsset.name}</h3>
          <p className="asset-id">ID: {selectedAsset.id}</p>
        </div>

        <div className="inspector-section">
          <h4>Transform</h4>
          <label>
            Scale
            <input
              type="text"
              defaultValue={localOverride.scale?.join(', ') || '1, 1, 1'}
              onChange={(e) => {
                const values = e.target.value.split(',').map((v) => parseFloat(v.trim()));
                if (values.length === 3 && values.every((v) => !isNaN(v))) {
                  handleChange('scale', values as [number, number, number]);
                }
              }}
            />
          </label>
          <label>
            Rotation
            <input
              type="text"
              defaultValue={localOverride.rotation?.join(', ') || '0, 0, 0'}
              onChange={(e) => {
                const values = e.target.value.split(',').map((v) => parseFloat(v.trim()));
                if (values.length === 3 && values.every((v) => !isNaN(v))) {
                  handleChange('rotation', values as [number, number, number]);
                }
              }}
            />
          </label>
          <label>
            Offset
            <input
              type="text"
              defaultValue={localOverride.offset?.join(', ') || '0, 0, 0'}
              onChange={(e) => {
                const values = e.target.value.split(',').map((v) => parseFloat(v.trim()));
                if (values.length === 3 && values.every((v) => !isNaN(v))) {
                  handleChange('offset', values as [number, number, number]);
                }
              }}
            />
          </label>
        </div>

        <div className="inspector-section">
          <h4>Rendering</h4>
          <label>
            <input
              type="checkbox"
              checked={localOverride.billboard || false}
              onChange={(e) => handleChange('billboard', e.target.checked)}
            />
            Billboard Mode
          </label>
          <label>
            <input
              type="checkbox"
              checked={localOverride.spriteMode || false}
              onChange={(e) => handleChange('spriteMode', e.target.checked)}
            />
            Sprite Mode
          </label>
        </div>

        {selectedAsset.type === 'enemy' && (
          <div className="inspector-section">
            <h4>Healthbar</h4>
            <label>
              <input
                type="checkbox"
                checked={localOverride.healthbar?.enabled || false}
                onChange={(e) => handleChange('healthbar.enabled', e.target.checked)}
              />
              Enabled
            </label>
            <label>
              Offset Y
              <input
                type="number"
                step="0.1"
                value={localOverride.healthbar?.offsetY || 1.5}
                onChange={(e) => handleChange('healthbar.offsetY', parseFloat(e.target.value))}
              />
            </label>
            <label>
              Width
              <input
                type="number"
                step="0.1"
                value={localOverride.healthbar?.width || 1.0}
                onChange={(e) => handleChange('healthbar.width', parseFloat(e.target.value))}
              />
            </label>
            <label>
              Height
              <input
                type="number"
                step="0.05"
                value={localOverride.healthbar?.height || 0.15}
                onChange={(e) => handleChange('healthbar.height', parseFloat(e.target.value))}
              />
            </label>
          </div>
        )}

        {selectedAsset.type === 'tower' && (
          <div className="inspector-section">
            <h4>Icon Badge</h4>
            <label>
              <input
                type="checkbox"
                checked={localOverride.iconBadge?.enabled || false}
                onChange={(e) => handleChange('iconBadge.enabled', e.target.checked)}
              />
              Enabled
            </label>
            <label>
              Icon Path
              <input
                type="text"
                value={localOverride.iconBadge?.icon || ''}
                onChange={(e) => handleChange('iconBadge.icon', e.target.value)}
              />
            </label>
            <label>
              Scale
              <input
                type="number"
                step="0.1"
                value={localOverride.iconBadge?.scale || 0.5}
                onChange={(e) => handleChange('iconBadge.scale', parseFloat(e.target.value))}
              />
            </label>
            <label>
              Offset Y
              <input
                type="number"
                step="0.1"
                value={localOverride.iconBadge?.offsetY || 2.0}
                onChange={(e) => handleChange('iconBadge.offsetY', parseFloat(e.target.value))}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={localOverride.iconBadge?.outline || false}
                onChange={(e) => handleChange('iconBadge.outline', e.target.checked)}
              />
              Outline
            </label>
          </div>
        )}

        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

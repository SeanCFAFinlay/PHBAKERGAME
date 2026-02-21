import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import './AssetInspector.css';

export const AssetInspector: React.FC = () => {
  const { selectedAsset, overrides, updateOverride } = useEditorStore();

  const [scaleStr, setScaleStr] = useState('1, 1, 1');
  const [rotationStr, setRotationStr] = useState('0, 0, 0');
  const [offsetStr, setOffsetStr] = useState('0, 0, 0');

  React.useEffect(() => {
    if (selectedAsset) {
      const override = overrides[selectedAsset.id] || {};
      setScaleStr(override.scale?.join(', ') || '1, 1, 1');
      setRotationStr(override.rotation?.join(', ') || '0, 0, 0');
      setOffsetStr(override.offset?.join(', ') || '0, 0, 0');
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
    if (!selectedAsset) return;

    const override = overrides[selectedAsset.id] || {};

    // Parse and update scale
    const scaleValues = scaleStr.split(',').map((v) => parseFloat(v.trim()));
    if (scaleValues.length === 3 && scaleValues.every((v) => !isNaN(v))) {
      override.scale = scaleValues as [number, number, number];
    }

    // Parse and update rotation
    const rotationValues = rotationStr.split(',').map((v) => parseFloat(v.trim()));
    if (rotationValues.length === 3 && rotationValues.every((v) => !isNaN(v))) {
      override.rotation = rotationValues as [number, number, number];
    }

    // Parse and update offset
    const offsetValues = offsetStr.split(',').map((v) => parseFloat(v.trim()));
    if (offsetValues.length === 3 && offsetValues.every((v) => !isNaN(v))) {
      override.offset = offsetValues as [number, number, number];
    }

    updateOverride(selectedAsset.id, override);
  };

  if (!selectedAsset) {
    return (
      <div className="asset-inspector">
        <div className="empty-state">
          <p>Select an asset to edit</p>
        </div>
      </div>
    );
  }

  const currentOverride = overrides[selectedAsset.id] || {};

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
            <input type="text" value={scaleStr} onChange={(e) => setScaleStr(e.target.value)} />
          </label>
          <label>
            Rotation
            <input
              type="text"
              value={rotationStr}
              onChange={(e) => setRotationStr(e.target.value)}
            />
          </label>
          <label>
            Offset
            <input type="text" value={offsetStr} onChange={(e) => setOffsetStr(e.target.value)} />
          </label>
        </div>

        <div className="inspector-section">
          <h4>Rendering</h4>
          <label>
            <input
              type="checkbox"
              checked={currentOverride.billboard || false}
              onChange={(e) => {
                updateOverride(selectedAsset.id, {
                  ...currentOverride,
                  billboard: e.target.checked,
                });
              }}
            />
            Billboard Mode
          </label>
          <label>
            <input
              type="checkbox"
              checked={currentOverride.spriteMode || false}
              onChange={(e) => {
                updateOverride(selectedAsset.id, {
                  ...currentOverride,
                  spriteMode: e.target.checked,
                });
              }}
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
                checked={currentOverride.healthbar?.enabled || false}
                onChange={(e) => {
                  updateOverride(selectedAsset.id, {
                    ...currentOverride,
                    healthbar: { ...(currentOverride.healthbar || {}), enabled: e.target.checked },
                  });
                }}
              />
              Enabled
            </label>
            <label>
              Offset Y
              <input
                type="number"
                step="0.1"
                value={currentOverride.healthbar?.offsetY || 1.5}
                onChange={(e) => {
                  updateOverride(selectedAsset.id, {
                    ...currentOverride,
                    healthbar: {
                      ...(currentOverride.healthbar || {}),
                      offsetY: parseFloat(e.target.value),
                    },
                  });
                }}
              />
            </label>
            <label>
              Width
              <input
                type="number"
                step="0.1"
                value={currentOverride.healthbar?.width || 1.0}
                onChange={(e) => {
                  updateOverride(selectedAsset.id, {
                    ...currentOverride,
                    healthbar: {
                      ...(currentOverride.healthbar || {}),
                      width: parseFloat(e.target.value),
                    },
                  });
                }}
              />
            </label>
            <label>
              Height
              <input
                type="number"
                step="0.05"
                value={currentOverride.healthbar?.height || 0.15}
                onChange={(e) => {
                  updateOverride(selectedAsset.id, {
                    ...currentOverride,
                    healthbar: {
                      ...(currentOverride.healthbar || {}),
                      height: parseFloat(e.target.value),
                    },
                  });
                }}
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
                checked={currentOverride.iconBadge?.enabled || false}
                onChange={(e) => {
                  updateOverride(selectedAsset.id, {
                    ...currentOverride,
                    iconBadge: { ...(currentOverride.iconBadge || {}), enabled: e.target.checked },
                  });
                }}
              />
              Enabled
            </label>
            <label>
              Icon Path
              <input
                type="text"
                value={currentOverride.iconBadge?.icon || ''}
                onChange={(e) => {
                  updateOverride(selectedAsset.id, {
                    ...currentOverride,
                    iconBadge: { ...(currentOverride.iconBadge || {}), icon: e.target.value },
                  });
                }}
              />
            </label>
            <label>
              Scale
              <input
                type="number"
                step="0.1"
                value={currentOverride.iconBadge?.scale || 0.5}
                onChange={(e) => {
                  updateOverride(selectedAsset.id, {
                    ...currentOverride,
                    iconBadge: {
                      ...(currentOverride.iconBadge || {}),
                      scale: parseFloat(e.target.value),
                    },
                  });
                }}
              />
            </label>
            <label>
              Offset Y
              <input
                type="number"
                step="0.1"
                value={currentOverride.iconBadge?.offsetY || 2.0}
                onChange={(e) => {
                  updateOverride(selectedAsset.id, {
                    ...currentOverride,
                    iconBadge: {
                      ...(currentOverride.iconBadge || {}),
                      offsetY: parseFloat(e.target.value),
                    },
                  });
                }}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={currentOverride.iconBadge?.outline || false}
                onChange={(e) => {
                  updateOverride(selectedAsset.id, {
                    ...currentOverride,
                    iconBadge: { ...(currentOverride.iconBadge || {}), outline: e.target.checked },
                  });
                }}
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

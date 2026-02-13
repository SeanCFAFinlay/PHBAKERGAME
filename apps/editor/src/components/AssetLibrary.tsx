import React from 'react';
import { useEditorStore } from '../store/editorStore';
import './AssetLibrary.css';

export const AssetLibrary: React.FC = () => {
  const { assets, selectedAsset, setSelectedAsset } = useEditorStore();

  return (
    <div className="asset-library">
      <h2>Asset Library</h2>
      <div className="asset-grid">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className={`asset-card ${selectedAsset?.id === asset.id ? 'selected' : ''}`}
            onClick={() => setSelectedAsset(asset)}
          >
            <div className="asset-thumbnail">
              <img src={asset.thumbnail} alt={asset.name} />
            </div>
            <div className="asset-info">
              <h3>{asset.name}</h3>
              <span className={`asset-type ${asset.type}`}>{asset.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

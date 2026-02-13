import { useEffect } from 'react';
import { useEditorStore } from './store/editorStore';
import { AssetLibrary } from './components/AssetLibrary';
import { AssetInspector } from './components/AssetInspector';
import { AIPreviewPanel } from './components/AIPreviewPanel';
import { AssetManifestEntry } from '@shared/types';
import manifestData from '@assets/manifest.json';
import overridesData from '@configs/overrides.json';
import './App.css';

function App() {
  const { currentTab, setCurrentTab, setAssets, setOverrides } = useEditorStore();

  useEffect(() => {
    // Load manifest and overrides on startup
    setAssets(manifestData.assets as AssetManifestEntry[]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOverrides(overridesData as any);
  }, [setAssets, setOverrides]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="logo">🧁</div>
          <div>
            <h1>Bakery vs Dentist</h1>
            <p className="subtitle">Editor Dashboard</p>
          </div>
        </div>
        <nav className="tabs">
          <button
            className={`tab-btn ${currentTab === 'assets' ? 'active' : ''}`}
            onClick={() => setCurrentTab('assets')}
          >
            Assets
          </button>
          <button
            className={`tab-btn ${currentTab === 'maps' ? 'active' : ''}`}
            onClick={() => setCurrentTab('maps')}
          >
            Maps
          </button>
          <button
            className={`tab-btn ${currentTab === 'waves' ? 'active' : ''}`}
            onClick={() => setCurrentTab('waves')}
          >
            Waves
          </button>
          <button
            className={`tab-btn ${currentTab === 'ai-preview' ? 'active' : ''}`}
            onClick={() => setCurrentTab('ai-preview')}
          >
            AI Preview
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentTab === 'assets' && (
          <div className="two-column-layout">
            <AssetLibrary />
            <AssetInspector />
          </div>
        )}
        {currentTab === 'maps' && (
          <div className="placeholder-panel">
            <h2>Map Editor</h2>
            <p>Coming soon - drag and drop path editor, spawn points, defend zones</p>
          </div>
        )}
        {currentTab === 'waves' && (
          <div className="placeholder-panel">
            <h2>Wave Editor</h2>
            <p>Coming soon - wave configuration, enemy types, counts, intervals</p>
          </div>
        )}
        {currentTab === 'ai-preview' && <AIPreviewPanel />}
      </main>
    </div>
  );
}

export default App;

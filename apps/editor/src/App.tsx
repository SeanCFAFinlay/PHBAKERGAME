import { usePackStore } from './store/packStore';
import { AssetsTab } from './components/AssetsTab';
import { MapBuilderTab } from './components/MapBuilderTab';
import { ExportImportTab } from './components/ExportImportTab';
import { HowItWorksTab } from './components/HowItWorksTab';
import './App.css';

function App() {
  const { currentTab, setCurrentTab } = usePackStore();

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
            className={`tab-btn ${currentTab === 'mapbuilder' ? 'active' : ''}`}
            onClick={() => setCurrentTab('mapbuilder')}
          >
            Map Builder
          </button>
          <button
            className={`tab-btn ${currentTab === 'exportimport' ? 'active' : ''}`}
            onClick={() => setCurrentTab('exportimport')}
          >
            Export/Import
          </button>
          <button
            className={`tab-btn ${currentTab === 'howto' ? 'active' : ''}`}
            onClick={() => setCurrentTab('howto')}
          >
            How It Works
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentTab === 'assets' && <AssetsTab />}
        {currentTab === 'mapbuilder' && <MapBuilderTab />}
        {currentTab === 'exportimport' && <ExportImportTab />}
        {currentTab === 'howto' && <HowItWorksTab />}
      </main>
    </div>
  );
}

export default App;

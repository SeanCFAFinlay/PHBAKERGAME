import React, { useRef, useState } from 'react';
import { exportPack, importPack } from '@pack/validation';
import { usePackStore } from '../store/packStore';

export function ExportImportTab() {
  const { assets, maps, setAssets, setMaps } = usePackStore();
  const [status, setStatus] = useState('');
  const [rawText, setRawText] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);

  function getPackJson() {
    return exportPack({ assets, maps });
  }

  function handleExport() {
    const json = getPackJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pack.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Pack exported!');
  }

  function handleCopy() {
    navigator.clipboard.writeText(getPackJson()).then(
      () => setStatus('Copied to clipboard!'),
      () => setStatus('Copy failed — check browser permissions.'),
    );
  }

  function mergePack(json: string) {
    try {
      const pack = importPack(json);
      const existingAssetIds = new Set(assets.map((a) => a.id));
      const existingMapIds = new Set(maps.map((m) => m.id));
      const newAssets = pack.assets.filter((a) => !existingAssetIds.has(a.id));
      const newMaps = pack.maps.filter((m) => !existingMapIds.has(m.id));
      setAssets([...assets, ...newAssets]);
      setMaps([...maps, ...newMaps]);
      setStatus(`Imported: +${newAssets.length} assets, +${newMaps.length} maps (duplicates skipped).`);
    } catch (err) {
      setStatus(`Import failed: ${String(err)}`);
    }
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => mergePack(reader.result as string);
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleImportText() {
    if (!rawText.trim()) { setStatus('Paste JSON first.'); return; }
    mergePack(rawText);
  }

  // Stats
  const catCounts: Record<string, number> = {};
  assets.forEach((a) => { catCounts[a.category] = (catCounts[a.category] ?? 0) + 1; });
  const themeCounts: Record<string, number> = {};
  maps.forEach((m) => { themeCounts[m.theme] = (themeCounts[m.theme] ?? 0) + 1; });

  return (
    <div className="tab-content">
      <div className="panel" style={{ marginBottom: 16 }}>
        <h2 className="panel-title">Export / Import Pack</h2>

        <div className="controls-row" style={{ marginBottom: 16 }}>
          <button className="btn btn--primary" onClick={handleExport}>⬇ Export Pack JSON</button>
          <button className="btn btn--secondary" onClick={handleCopy}>📋 Copy Pack JSON</button>
          <button className="btn btn--secondary" onClick={() => importFileRef.current?.click()}>⬆ Import Pack JSON</button>
          <input ref={importFileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImportFile} />
        </div>

        {status && <div className="status-msg">{status}</div>}

        <div className="form-group" style={{ marginTop: 16 }}>
          <label>Import from Pasted JSON</label>
          <textarea
            className="textarea"
            rows={6}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={'{"version":1,"assets":[...],"maps":[...]}'}
          />
          <button className="btn btn--secondary" style={{ marginTop: 8 }} onClick={handleImportText}>
            Import from Text
          </button>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__title">Total Assets</div>
            <div className="stat-card__value">{assets.length}</div>
          </div>
          {Object.entries(catCounts).map(([cat, count]) => (
            <div key={cat} className="stat-card">
              <div className="stat-card__title">{cat}</div>
              <div className="stat-card__value">{count}</div>
            </div>
          ))}
          <div className="stat-card">
            <div className="stat-card__title">Total Maps</div>
            <div className="stat-card__value">{maps.length}</div>
          </div>
          {Object.entries(themeCounts).map(([theme, count]) => (
            <div key={theme} className="stat-card">
              <div className="stat-card__title">maps/{theme}</div>
              <div className="stat-card__value">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

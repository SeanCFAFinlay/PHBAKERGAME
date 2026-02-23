import React, { useState, useRef, useCallback } from 'react';
import type { Asset, MapDefinition, MapEntity, MapSlot, MapTheme } from '@pack/types';
import { usePackStore } from '../store/packStore';

const CANVAS_W = 600;
const CANVAS_H = 400;

export function MapBuilderTab() {
  const { assets, maps, addMap, updateMap, deleteMap } = usePackStore();

  const [theme, setTheme] = useState<MapTheme>('bakery');
  const [slot, setSlot] = useState<MapSlot>(1);
  const [mapName, setMapName] = useState('');
  const [entities, setEntities] = useState<MapEntity[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);

  const [selectedEntityIdx, setSelectedEntityIdx] = useState<number | null>(null);
  const [paletteAsset, setPaletteAsset] = useState<Asset | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const [savedMapId, setSavedMapId] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const paletteAssets = assets.filter((a) => a.theme === theme || a.theme === 'shared');

  function handleSave() {
    if (!mapName.trim()) { alert('Enter a map name first.'); return; }
    const now = Date.now();
    if (currentMapId) {
      const existing = maps.find((m) => m.id === currentMapId);
      if (existing) {
        updateMap({ ...existing, name: mapName, theme, slot, entities, updatedAt: now });
        return;
      }
    }
    const newMap: MapDefinition = {
      id: Date.now().toString(),
      name: mapName,
      theme,
      slot,
      entities,
      createdAt: now,
      updatedAt: now,
    };
    addMap(newMap);
    setCurrentMapId(newMap.id);
  }

  function handleDelete() {
    if (currentMapId && confirm('Delete this map?')) {
      deleteMap(currentMapId);
      setCurrentMapId(null);
      setEntities([]);
      setMapName('');
    }
  }

  function handleLoad() {
    if (!savedMapId) return;
    const m = maps.find((mp) => mp.id === savedMapId);
    if (!m) return;
    setCurrentMapId(m.id);
    setMapName(m.name);
    setTheme(m.theme);
    setSlot(m.slot);
    setEntities(m.entities);
    setSelectedEntityIdx(null);
  }

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!paletteAsset) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / CANVAS_W;
    const y = (e.clientY - rect.top) / CANVAS_H;
    const entity: MapEntity = { assetId: paletteAsset.id, x, y, rotationDeg: rotation, scale };
    setEntities((prev) => [...prev, entity]);
    setSelectedEntityIdx(null);
  }, [paletteAsset, rotation, scale]);

  function handleDeleteSelected() {
    if (selectedEntityIdx === null) return;
    setEntities((prev) => prev.filter((_, i) => i !== selectedEntityIdx));
    setSelectedEntityIdx(null);
  }

  function handleCanvasKey(e: React.KeyboardEvent) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEntityIdx !== null) {
      handleDeleteSelected();
    }
  }

  function handleExportJSON() {
    if (!mapName.trim()) { alert('Enter a map name first.'); return; }
    const now = Date.now();
    const mapDef: MapDefinition = {
      id: currentMapId ?? now.toString(),
      name: mapName,
      theme,
      slot,
      entities,
      createdAt: now,
      updatedAt: now,
    };
    const blob = new Blob([JSON.stringify(mapDef, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const m = JSON.parse(reader.result as string) as MapDefinition;
        setCurrentMapId(m.id ?? null);
        setMapName(m.name ?? '');
        setTheme(m.theme ?? 'bakery');
        setSlot((m.slot ?? 1) as MapSlot);
        setEntities(m.entities ?? []);
        setSelectedEntityIdx(null);
      } catch {
        alert('Invalid map JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const assetById = new Map(assets.map((a) => [a.id, a]));

  return (
    <div className="tab-content">
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="controls-row">
          <div className="form-group">
            <label>Theme</label>
            <select className="select" value={theme} onChange={(e) => setTheme(e.target.value as MapTheme)}>
              <option value="bakery">bakery</option>
              <option value="dentist">dentist</option>
            </select>
          </div>
          <div className="form-group">
            <label>Slot</label>
            <select className="select" value={slot} onChange={(e) => setSlot(Number(e.target.value) as MapSlot)}>
              {([1, 2, 3, 4, 5] as MapSlot[]).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Map Name</label>
            <input className="input" value={mapName} onChange={(e) => setMapName(e.target.value)} placeholder="My Map" />
          </div>
          <div className="form-group form-group--btn">
            <button className="btn btn--primary" onClick={handleSave}>
              {currentMapId ? 'Save / Overwrite' : 'Save New'}
            </button>
            {currentMapId && (
              <button className="btn btn--danger" onClick={handleDelete}>Delete Map</button>
            )}
          </div>
        </div>
        <div className="controls-row" style={{ marginTop: 8 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Load Saved Map</label>
            <select className="select" value={savedMapId} onChange={(e) => setSavedMapId(e.target.value)}>
              <option value="">-- select map --</option>
              {maps.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.theme}, slot {m.slot})</option>)}
            </select>
          </div>
          <div className="form-group form-group--btn">
            <button className="btn btn--secondary" onClick={handleLoad}>Load Selected</button>
            <button className="btn btn--secondary" onClick={() => { setEntities([]); setSelectedEntityIdx(null); }}>Clear Canvas</button>
          </div>
        </div>
      </div>

      <div className="map-builder-layout">
        <div className="panel palette-panel">
          <h3 className="panel-title">Palette</h3>
          <div className="form-row" style={{ marginBottom: 8 }}>
            <div className="form-group">
              <label>Rotation (°)</label>
              <input className="input" type="number" min={0} max={360} value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))} style={{ width: 80 }} />
            </div>
            <div className="form-group">
              <label>Scale</label>
              <input className="input" type="number" min={0.1} max={3} step={0.1} value={scale}
                onChange={(e) => setScale(Number(e.target.value))} style={{ width: 80 }} />
            </div>
          </div>
          <div className="palette-list">
            {paletteAssets.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 12 }}>No assets for this theme. Create some in the Assets tab.</p>
            )}
            {paletteAssets.map((a) => (
              <div
                key={a.id}
                className={`palette-item ${paletteAsset?.id === a.id ? 'palette-item--selected' : ''}`}
                onClick={() => setPaletteAsset(paletteAsset?.id === a.id ? null : a)}
              >
                <span className="palette-item__thumb">
                  {a.imageDataUrl ? <img src={a.imageDataUrl} alt={a.name} /> : (a.emoji || '📦')}
                </span>
                <span className="palette-item__name">{a.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div
            ref={canvasRef}
            className="map-canvas"
            style={{ width: CANVAS_W, height: CANVAS_H, cursor: paletteAsset ? 'crosshair' : 'default' }}
            onClick={handleCanvasClick}
            onKeyDown={handleCanvasKey}
            tabIndex={0}
          >
            {entities.map((ent, i) => {
              const a = assetById.get(ent.assetId);
              return (
                <div
                  key={i}
                  className={`entity-chip ${selectedEntityIdx === i ? 'entity-chip--selected' : ''}`}
                  style={{
                    left: ent.x * CANVAS_W,
                    top: ent.y * CANVAS_H,
                    transform: `translate(-50%, -50%) rotate(${ent.rotationDeg}deg) scale(${ent.scale})`,
                  }}
                  onClick={(e) => { e.stopPropagation(); setSelectedEntityIdx(i === selectedEntityIdx ? null : i); }}
                >
                  {a?.imageDataUrl ? <img src={a.imageDataUrl} alt={a?.name} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                    : (a?.emoji || '📦')}
                </div>
              );
            })}
          </div>
          <div className="controls-row" style={{ marginTop: 8 }}>
            {selectedEntityIdx !== null && (
              <button className="btn btn--danger btn--sm" onClick={handleDeleteSelected}>
                Delete Selected (Del)
              </button>
            )}
            <button className="btn btn--secondary btn--sm" onClick={handleExportJSON}>Export JSON</button>
            <button className="btn btn--secondary btn--sm" onClick={() => importFileRef.current?.click()}>Import JSON</button>
            <input ref={importFileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImportJSON} />
            <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 'auto' }}>
              {entities.length} entities{paletteAsset ? ` • placing: ${paletteAsset.name}` : ' • click palette to select'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

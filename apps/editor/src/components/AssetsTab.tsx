import React, { useState, useRef } from 'react';
import type { Asset, AssetCategory, AssetTheme, SizeHint } from '@pack/types';
import { usePackStore } from '../store/packStore';

const CATEGORIES: AssetCategory[] = ['tower', 'enemy', 'obstacle', 'pen', 'ui', 'character', 'fx'];
const THEMES: AssetTheme[] = ['bakery', 'dentist', 'shared'];
const SIZE_HINTS: SizeHint[] = ['normal', 'big'];

const EMPTY_FORM = {
  name: '',
  category: 'tower' as AssetCategory,
  theme: 'bakery' as AssetTheme,
  emoji: '',
  sizeHint: 'normal' as SizeHint,
  desc: '',
  imageDataUrl: '',
};

export function AssetsTab() {
  const { assets, addAsset, updateAsset, deleteAsset } = usePackStore();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<AssetCategory | 'all'>('all');
  const [themeFilter, setThemeFilter] = useState<AssetTheme | 'all'>('all');
  const fileRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editId) {
      updateAsset({ id: editId, ...form });
      setEditId(null);
    } else {
      addAsset({ id: Date.now().toString(), ...form });
    }
    resetForm();
  }

  function handleEdit(asset: Asset) {
    setForm({
      name: asset.name,
      category: asset.category,
      theme: asset.theme,
      emoji: asset.emoji ?? '',
      sizeHint: asset.sizeHint,
      desc: asset.desc ?? '',
      imageDataUrl: asset.imageDataUrl ?? '',
    });
    setEditId(asset.id);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, imageDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  const filtered = assets.filter((a) => {
    if (catFilter !== 'all' && a.category !== catFilter) return false;
    if (themeFilter !== 'all' && a.theme !== themeFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="tab-content">
      <div className="panel" style={{ marginBottom: 16 }}>
        <h2 className="panel-title">{editId ? 'Edit Asset' : 'New Asset'}</h2>
        <form onSubmit={handleSubmit} className="asset-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Asset name"
                required
              />
            </div>
            <div className="form-group">
              <label>Emoji</label>
              <input
                className="input"
                value={form.emoji}
                onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                placeholder="🧁"
                maxLength={4}
                style={{ width: 80 }}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                className="select"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value as AssetCategory }))
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Theme</label>
              <select
                className="select"
                value={form.theme}
                onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value as AssetTheme }))}
              >
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Size Hint</label>
              <select
                className="select"
                value={form.sizeHint}
                onChange={(e) => setForm((f) => ({ ...f, sizeHint: e.target.value as SizeHint }))}
              >
                {SIZE_HINTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="textarea"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              rows={2}
              placeholder="Optional description"
            />
          </div>
          <div className="form-row form-row--align">
            <div className="form-group">
              <label>Image</label>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => fileRef.current?.click()}
              >
                Upload Image
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>
            {form.imageDataUrl && (
              <img
                src={form.imageDataUrl}
                alt="preview"
                style={{
                  width: 48,
                  height: 48,
                  objectFit: 'contain',
                  borderRadius: 8,
                  border: '1px solid #22314a',
                }}
              />
            )}
          </div>
          <div className="form-row">
            <button type="submit" className="btn btn--primary">
              {editId ? 'Save Changes' : 'Create Asset'}
            </button>
            {editId && (
              <button type="button" className="btn btn--secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="filter-bar">
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets…"
            style={{ flex: 1, maxWidth: 240 }}
          />
          <div className="filter-group">
            <button
              className={`filter-btn ${catFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCatFilter('all')}
            >
              all
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`filter-btn ${catFilter === c ? 'active' : ''}`}
                onClick={() => setCatFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <button
              className={`filter-btn ${themeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setThemeFilter('all')}
            >
              all themes
            </button>
            {THEMES.map((t) => (
              <button
                key={t}
                className={`filter-btn ${themeFilter === t ? 'active' : ''}`}
                onClick={() => setThemeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '32px', textAlign: 'center' }}>
            No assets yet. Create one above!
          </p>
        ) : (
          <div className="asset-grid">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                className={`asset-card ${editId === asset.id ? 'asset-card--selected' : ''}`}
              >
                <div className="asset-card__thumb">
                  {asset.imageDataUrl ? (
                    <img src={asset.imageDataUrl} alt={asset.name} />
                  ) : (
                    <span>{asset.emoji || '📦'}</span>
                  )}
                </div>
                <div className="asset-card__info">
                  <div className="asset-card__name">{asset.name}</div>
                  <div className="asset-card__badges">
                    <span className="badge badge--cat">{asset.category}</span>
                    <span className="badge badge--theme">{asset.theme}</span>
                  </div>
                </div>
                <div className="asset-card__actions">
                  <button className="btn btn--xs btn--secondary" onClick={() => handleEdit(asset)}>
                    Edit
                  </button>
                  <button className="btn btn--xs btn--danger" onClick={() => deleteAsset(asset.id)}>
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

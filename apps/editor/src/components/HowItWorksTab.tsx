export function HowItWorksTab() {
  return (
    <div className="tab-content">
      <div className="panel howto-panel">
        <h2 className="panel-title">How It Works</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          This editor lets you build the asset pack and map definitions for{' '}
          <strong>Bakery vs Dentist</strong>.
        </p>

        <div className="howto-steps">
          <div className="howto-step">
            <div className="howto-step__num">1</div>
            <div className="howto-step__body">
              <h3>Create Assets</h3>
              <p>
                Head to the <strong>Assets</strong> tab to define every game object: towers,
                enemies, obstacles, pens, UI elements, characters and effects. Give each asset a
                name, category, theme (bakery / dentist / shared), an optional emoji or uploaded
                image, and a size hint. Assets are saved automatically to your browser&apos;s
                localStorage.
              </p>
            </div>
          </div>

          <div className="howto-step">
            <div className="howto-step__num">2</div>
            <div className="howto-step__body">
              <h3>Build Maps</h3>
              <p>
                Switch to the <strong>Map Builder</strong> tab. Choose a theme and slot (1–5), give
                the map a name, then click assets in the palette on the left to select them for
                placement. Click anywhere on the canvas to drop an entity at that position. Adjust
                rotation and scale before placing. Click a placed entity to select it, then press{' '}
                <kbd>Del</kbd> or <kbd>Backspace</kbd> to remove it. Hit
                <strong> Save</strong> to persist the map.
              </p>
            </div>
          </div>

          <div className="howto-step">
            <div className="howto-step__num">3</div>
            <div className="howto-step__body">
              <h3>Export the Pack</h3>
              <p>
                On the <strong>Export / Import</strong> tab you can download the full pack as a
                single
                <code>pack.json</code> file, copy it to the clipboard, or paste/import a previously
                saved pack. The JSON contains a versioned object with both the <code>assets</code>{' '}
                and <code>maps</code> arrays. Importing merges new items while skipping duplicates
                by ID.
              </p>
            </div>
          </div>

          <div className="howto-step">
            <div className="howto-step__num">4</div>
            <div className="howto-step__body">
              <h3>Load in Game</h3>
              <p>
                Place the exported <code>pack.json</code> in the game&apos;s asset folder (or load
                it at runtime via the game&apos;s <code>importPack()</code> loader from{' '}
                <code>packages/shared/src/validation.ts</code>). The game reads the asset and map
                definitions at startup to render sprites, place entities on the canvas, and
                configure wave logic.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

# PHBAKERGAME - Production Game + Editor Dashboard

A professional tower defense game built with Three.js, Vite, TypeScript, and React.

## 🏗️ Architecture

This is a monorepo using npm workspaces with two main applications:

- **Game Runtime** (`/apps/game`) - Vite + TypeScript + Three.js
- **Editor Dashboard** (`/apps/editor`) - React + Vite + TypeScript + Three.js

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
npm install
```

### Development

Run the game in development mode:

```bash
npm run dev:game
```

Run the editor dashboard:

```bash
npm run dev:editor
```

### Build

Build both applications:

```bash
npm run build
```

Build individually:

```bash
npm run build:game
npm run build:editor
```

### Linting & Formatting

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting
```

## 📁 Project Structure

```
PHBAKERGAME/
├── apps/
│   ├── game/          # Game runtime (Vite + TS)
│   └── editor/        # Editor dashboard (React + TS)
├── packages/shared/   # Shared runtime schema, loaders, camera config
├── shared/            # Shared type definitions
├── assets/            # Game assets (models, images, icons)
│   └── manifest.json  # Asset manifest
├── configs/           # Configuration files
│   └── overrides.json # Per-asset rendering overrides
├── data/              # Game data
│   └── local/         # Local data files
└── package.json       # Root workspace config
```

Shared code layout:
- `packages/shared/` exports runtime helpers used by the game/editor (schema, loaders, camera config).
- `shared/types/` contains type-only definitions consumed by the editor UI.

## ✨ Features

### Game Runtime

- ✅ Modern Three.js rendering with correct color spaces
- ✅ Billboard system (full camera-facing + Y-axis-only)
- ✅ Dynamic healthbars for enemies
- ✅ Icon badges for towers
- ✅ LOD system support
- ✅ Debug visualization toggles
- ✅ Performance monitoring (Stats.js)
- ✅ No CDN dependencies - fully offline capable

### Editor Dashboard

- ✅ Asset library with thumbnails
- ✅ Asset inspector with live editing
- ✅ Map editor (coming soon)
- ✅ Wave editor (coming soon)
- ✅ AI preview panel for asset processing
- ✅ Same camera system as game for accurate previews
- ✅ Zustand state management
- ✅ Modern React 18 + TypeScript

### AI Preview Panel (Workflow Support)

- ✅ Prompt text field (metadata)
- ✅ Drag-and-drop image upload
- ✅ Live Three.js preview with game camera
- ✅ Image cropping tools
- ✅ Transparency threshold adjustment
- ✅ Padding and outline processing
- ✅ Background color selection
- ✅ Grid and turntable visualization
- ✅ Export processed PNG assets

## 🎮 Game Controls

- **D** - Toggle debug mode
- **B** - Toggle bounding boxes
- **H** - Toggle hitboxes
- **L** - Toggle LOD visualization

## 🎨 Editor Tabs

1. **Assets** - Browse and edit asset properties
2. **Maps** - Design map layouts (coming soon)
3. **Waves** - Configure enemy waves (coming soon)
4. **AI Preview** - Process and preview asset images

## 📦 Dependencies

All dependencies are installed via npm (no CDNs):

- Three.js - 3D rendering
- Vite - Build tool
- TypeScript - Type safety
- React - UI framework (editor only)
- Zustand - State management (editor)
- Stats.js - Performance monitoring

## 🔒 Offline Support

The application runs fully offline after installation. All dependencies are bundled, and no external CDN requests are made.

## 📝 Configuration

### Asset Manifest (`/assets/manifest.json`)

Defines all available assets with metadata:

- `id` - Unique identifier
- `name` - Display name
- `type` - Asset type (enemy, tower, prop, ui)
- `file` - Path to asset file
- `thumbnail` - Path to thumbnail image

### Overrides Config (`/configs/overrides.json`)

Per-asset rendering configuration:

- Transform (scale, rotation, offset)
- Billboard mode
- Sprite mode
- LOD settings
- Material overrides
- Healthbar configuration (enemies)
- Icon badge configuration (towers)
- Hitbox settings

## 🛠️ Development

The project uses:

- ESLint for code quality
- Prettier for code formatting
- TypeScript strict mode
- Vite for fast development and optimized builds

## 📄 License

See repository for license information.

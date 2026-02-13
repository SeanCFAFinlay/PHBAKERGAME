import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "assets/manifest.json");
const overridesPath = path.join(root, "configs/overrides.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

if (!fs.existsSync(manifestPath)) throw new Error("Missing assets/manifest.json");
if (!fs.existsSync(overridesPath)) throw new Error("Missing configs/overrides.json");

const manifest = readJson(manifestPath);
const overrides = readJson(overridesPath);

let ok = true;

for (const a of (manifest.assets ?? [])) {
  const file = a.file?.replace(/^\\//, "");
  const thumb = a.thumbnail?.replace(/^\\//, "");
  if (file && !fs.existsSync(path.join(root, file))) { console.error("Missing asset file:", a.id, a.file); ok = false; }
  if (thumb && !fs.existsSync(path.join(root, thumb))) { console.error("Missing thumbnail:", a.id, a.thumbnail); ok = false; }
  if (!overrides[a.id]) { console.warn("No overrides entry for", a.id); }
}

if (!ok) process.exit(1);
console.log("validate:assets OK");

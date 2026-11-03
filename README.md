# WONIO - Apple Design

## Lokal in VS Code

Voraussetzung: Node.js 18 oder neuer.

```bash
npm install
npm run dev
```

Danach die lokale URL aus dem Terminal (normalerweise `http://localhost:5173`) im Browser öffnen.

Für einen Produktionsbuild:

```bash
npm run build
npm run preview
```

Der fertige Build liegt anschließend im Ordner `dist/` und kann auf Netlify oder Vercel deployed werden.

## Schnell online bringen

Alternativ kann die statische Datei `wonio-apple-built.html` in `index.html` umbenannt und direkt hochgeladen werden. Die React-Version mit Vite ist für lokale Weiterentwicklung vorgesehen.

## Inhalt
- App.tsx = Apple Design mit Dark/Light Mode
- index.css = Apple Farben #FFFFFF / #000000 + #0071E3
- wonio-apple-built.html = Fertige Seite zum direkt hochladen

Für Sartorius Gespräch: Einfach Link zeigen.

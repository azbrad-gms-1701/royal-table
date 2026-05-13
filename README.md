# ♠ Royal Table

Mesa privada de cartas para usar con videollamada. El anfitrión controla la mesa y muestra las manos a los demás jugadores por cámara.

## Juegos disponibles
- **Carta Mayor** — gana quien tenga la carta más alta
- **Black Jack** — clásico 21
- **Baccarat** — jugador vs banca

## Cómo correr localmente

npm install
npm run dev

## Cómo publicar en GitHub Pages

npm run build

Luego sube la carpeta `dist/` a tu repo y activa GitHub Pages en Settings → Pages → rama `main` → carpeta `/dist`.

O usa el paquete `gh-pages`:

npm install --save-dev gh-pages

Agrega en `package.json` dentro de `"scripts"`:

"deploy": "gh-pages -d dist"

Y ejecuta:

npm run build && npm run deploy

## Jugadores
- Mínimo 2, máximo 8
- El jugador 1 es siempre el anfitrión
- Las manos de los demás se revelan con el botón REVELAR (para mostrar por cámara)
# Royal Table

Salón de juegos de cartas para aprender jugando, hecho con React y Vite. La portada separa las partidas individuales de una mesa multijugador local. No hay apuestas, pagos, cuentas, niveles, ELO ni datos guardados.

## Iniciar

```bash
npm install
npm run dev
```

Comprobaciones: `npm test`, `npm run lint` y `npm run build`.

## Variantes de esta mesa

- **Solitario:** Klondike con 52 cartas, siete columnas y cuatro cimientos de as a rey. En las columnas se baja de valor alternando colores; solo un rey ocupa un hueco. Robo de una carta, reciclaje ilimitado del descarte y opción de deshacer. No se devuelven cartas desde los cimientos. [Reglas base de Klondike de Bicycle Cards](https://bicyclecards.com/how-to-play/klondike).
- **Alta o Baja:** variante sencilla de Royal Table para una persona. Se predice si la siguiente carta será mayor o menor; un valor igual deja la predicción nula. El as es alto, los palos no desempatan y no se acumulan puntos.
- **Carta Mayor:** duelo de una carta por lado con una baraja de 52 cartas. El as es alto; los palos no desempatan. Una igualdad de valores termina la ronda en empate. Esta es una variante simple definida para Royal Table.
- **Carta Mayor vs PC:** variante propia de Royal Table. Cada lado recibe tres cartas; eliges una y la PC juega la más alta de su mano. Se revelan las seis cartas al terminar. Se comparan solo las cartas jugadas; los valores iguales empatan. Las demás se descartan y el siguiente duelo usa una baraja nueva.
- **Carta Mayor · Mesa compartida:** entre dos y ocho puestos, con al menos una persona y hasta siete bots. Cada puesto recibe tres cartas de una misma baraja. Las personas eligen una carta en privado, por turnos en el mismo ordenador; los bots juegan la más alta de su mano. Gana el valor mayor y varias cartas del mismo valor máximo empatan. El as es alto y los palos no desempatan. Se muestran todas las manos al terminar para revisar la ronda. No hay puntuación acumulada.
- **Black Jack:** una baraja nueva por mano. As vale 1 u 11; figuras y 10 valen 10. La casa se planta en todo 17, incluido el 17 suave. Un Black Jack natural (as + carta de valor 10 en las dos primeras) supera a un 21 de más cartas. No hay fichas, dobles, divisiones ni seguro. [Reglas de referencia de Bicycle Cards](https://bicyclecards.com/how-to-play/blackjack/).
- **Baccarat:** Punto Banco con una baraja nueva por ronda. El jugador predice Punto, Banco o Empate; ambas manos siguen reglas fijas. La tercera carta obedece la [tabla del Código de Pensilvania](https://www.pacodeandbulletin.gov/secure/pacode/data/058/chapter631a/s631a.11.html). Si sale empate al elegir Punto o Banco, el pronóstico queda nulo. No hay apuestas ni comisión.

La lógica de cartas y resultados está en `src/game/`. Las mesas React están en `src/games/`. Los componentes compartidos de cartas y mesa están en `src/components/Table.jsx`.

## Publicación

El código fuente está en `main` y la versión compilada se publica en la raíz de la rama `gh-pages`. Para actualizarla, ejecuta `npm run build` y publica el contenido de `dist/` (no la carpeta completa) en esa rama.

Vite usa rutas relativas, por lo que el build funciona tanto en la raíz de un dominio como bajo `/royal-table/`. La navegación usa fragmentos de URL (`#...`) y funciona sin servidor ni configuración de rutas. Las fuentes tienen alternativas del sistema si no hay conexión.

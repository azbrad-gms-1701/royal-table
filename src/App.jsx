import { useEffect, useState } from 'react'
import { CartaMayor, BlackJack, Baccarat } from './games/Games.jsx'
import { CartaMayorVsPc } from './games/CartaMayorVsPc.jsx'
import { MultiplayerDuel } from './games/MultiplayerDuel.jsx'
import { Solitaire } from './games/Solitaire.jsx'
import { HighLow } from './games/HighLow.jsx'
import { GAMES, SOLO_GAME_IDS } from './game/config.js'
import { CardBack, CardFace } from './components/Table.jsx'
import { createDeck, shuffleDeck, SUITS } from './game/rules.js'
import './App.css'

const gameSymbols = { solitario: '♣', 'alta-baja': '↑', 'carta-mayor': '♠', blackjack: '21', baccarat: '♦' }

function Shell({ children }) {
  return <div className="lobby-page"><header className="site-header"><a href="#inicio" className="brand" aria-label="Royal Table, inicio"><span className="brand-symbol">♛</span><span>Royal <em>Table</em></span></a><span className="header-label">Salón de juegos de cartas</span></header><main id="contenido" className="lobby-main" tabIndex={-1}>{children}</main><footer className="site-footer"><span>ROYAL TABLE</span><span>Elige una mesa. Aprende jugando.</span></footer></div>
}

function Home() {
  const [previewCard, setPreviewCard] = useState(() => shuffleDeck(createDeck())[0])
  const drawPreview = () => setPreviewCard((current) => shuffleDeck(createDeck()).find((card) => card.id !== current.id))
  return <Shell><div className="lobby-copy"><p className="section-kicker">Bienvenido a la mesa</p><h1>Elige cómo<br /><em>quieres jugar.</em></h1><p>Una partida para ti, o una mesa compartida con amigos y bots. Sin cuentas, apuestas ni puntos acumulados.</p><div className="hero-signature"><span className="signature-line" aria-hidden="true" />Baraja, juega, vuelve a empezar</div></div><div className="lobby-visual"><div className="lobby-table-glow" aria-hidden="true" /><div className="lobby-card lobby-card-two" aria-hidden="true"><CardBack /></div><button type="button" className="lobby-card lobby-card-one" onClick={drawPreview} aria-label="Sacar otra carta de muestra"><CardFace key={previewCard.id} card={previewCard} /></button><div className="lobby-medallion" aria-hidden="true">♛</div><span className="lobby-card-caption">Toca la carta para probar la baraja</span><span className="sr-only" role="status">Carta de muestra: {previewCard.rank} de {SUITS.find((suit) => suit.key === previewCard.suit).name}</span></div>
    <section className="game-selection mode-selection" aria-labelledby="mode-title"><div className="selection-heading"><h2 id="mode-title">Tu lugar en la mesa</h2><span>Elige una forma de jugar</span></div><div className="mode-grid"><a className="mode-choice" href="#solo"><span className="mode-icon" aria-hidden="true">♠</span><span className="choice-number">01 / PARTIDA INDIVIDUAL</span><h3>Jugar solo</h3><p>Solitario y Alta o Baja sin rivales, más rondas de Carta Mayor, Black Jack y Baccarat.</p><strong>Explorar juegos <span aria-hidden="true">↗</span></strong></a><a className="mode-choice" href="#multijugador"><span className="mode-icon" aria-hidden="true">♛</span><span className="choice-number">02 / MESA COMPARTIDA</span><h3>Multijugador local</h3><p>Comparte este ordenador con otras personas o completa la mesa con hasta siete bots.</p><strong>Preparar mesa <span aria-hidden="true">↗</span></strong></a></div></section></Shell>
}

function SoloLobby() {
  return <Shell><div className="subpage-intro"><a className="back-link" href="#inicio">← Volver al inicio</a><p className="section-kicker">Partida individual</p><h1>Una mesa a tu ritmo.</h1><p>Solitario y Alta o Baja son solo tuyos, sin bots. Los demás ofrecen rondas breves contra la casa.</p></div><section className="game-selection" aria-labelledby="solo-title"><div className="selection-heading"><h2 id="solo-title">Elige un juego</h2><span>5 experiencias</span></div><div className="game-grid solo-grid">{SOLO_GAME_IDS.map((id) => { const game = GAMES[id]; return <article className="game-choice" key={id}><span className="choice-number">{game.number} / {['solitario', 'alta-baja'].includes(id) ? 'SIN RIVALES' : 'RONDA INDIVIDUAL'}</span><span className="choice-symbol" aria-hidden="true">{gameSymbols[id]}</span><h3>{game.name}</h3><p className="choice-intro">{game.intro}</p><div className="choice-actions"><a className="choice-link" href={`#${id}`}>Jugar <span aria-hidden="true">↗</span></a>{id === 'carta-mayor' && <a className="choice-link choice-link-secondary" href="#carta-mayor-pc">Contra un bot <span aria-hidden="true">↗</span></a>}</div></article> })}</div></section></Shell>
}

function Stepper({ label, value, min, max, onChange, hint }) {
  return <div className="setup-stepper"><div><strong>{label}</strong><span>{hint}</span></div><div className="stepper-control"><button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Quitar ${label.toLowerCase()}`}>−</button><output aria-label={`${label}: ${value}`}>{value}</output><button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Añadir ${label.toLowerCase()}`}>+</button></div></div>
}

function MultiplayerLobby() {
  const [humans, setHumans] = useState(2)
  const [bots, setBots] = useState(0)
  const changeHumans = (value) => { setHumans(value); setBots((current) => Math.min(current, 8 - value)) }
  const changeBots = (value) => { setBots(value); setHumans((current) => Math.min(current, 8 - value)) }
  const valid = humans + bots >= 2
  return <Shell><div className="subpage-intro multiplayer-intro"><a className="back-link" href="#inicio">← Volver al inicio</a><p className="section-kicker">Multijugador local</p><h1>Prepara tu mesa.</h1><p>Las personas comparten este ordenador por turnos. Puedes sumar bots para completar hasta ocho puestos.</p></div><section className="table-setup" aria-labelledby="setup-title"><div className="setup-heading"><span aria-hidden="true">♛</span><div><p className="section-kicker">Carta Mayor · Variante Royal Table</p><h2 id="setup-title">Elige participantes</h2><p>Cada uno recibe tres cartas y juega una. La carta más alta gana; el as supera al rey.</p></div></div><div className="setup-controls"><Stepper label="Personas" value={humans} min={1} max={8 - bots} onChange={changeHumans} hint="Por turnos en este ordenador" /><Stepper label="Bots" value={bots} min={0} max={Math.min(7, 8 - humans)} onChange={changeBots} hint="Juegan su carta más alta" /></div><div className="setup-footer"><p>{humans + bots} de 8 puestos ocupados · {bots === 0 ? 'Mesa entre personas' : `${bots} ${bots === 1 ? 'bot' : 'bots'}`}{!valid && <span className="setup-warning"> · Añade otra persona o un bot.</span>}</p><a className={`setup-start ${!valid ? 'setup-disabled' : ''}`} href={valid ? `#duelo?h=${humans}&b=${bots}` : '#multijugador'} aria-disabled={!valid} onClick={!valid ? (event) => event.preventDefault() : undefined}>Entrar a la mesa <span aria-hidden="true">→</span></a></div></section><div className="setup-footnote"><span aria-hidden="true">✧</span> No hay conexión en línea, cuentas ni progreso guardado. Cada ronda es independiente.</div></Shell>
}

function route() {
  const hash = window.location.hash.slice(1)
  const id = hash.split('?')[0]
  return { id: ['inicio', 'solo', 'multijugador'].includes(id) || GAMES[id] ? id : 'inicio', hash }
}

function duelSettings(hash) {
  const query = new URLSearchParams(hash.split('?')[1] || '')
  const humans = Math.min(8, Math.max(1, Number.parseInt(query.get('h'), 10) || 2))
  const bots = Math.min(7, Math.max(0, Number.parseInt(query.get('b'), 10) || 0), 8 - humans)
  return { humans, bots: humans + bots < 2 ? 1 : bots }
}

function App() {
  const [location, setLocation] = useState(route)
  useEffect(() => { const onHashChange = () => setLocation(route()); window.addEventListener('hashchange', onHashChange); return () => window.removeEventListener('hashchange', onHashChange) }, [])
  useEffect(() => { document.title = GAMES[location.id] ? `${GAMES[location.id].name} · Royal Table` : 'Royal Table · Juegos de cartas'; window.scrollTo(0, 0) }, [location])
  const skipToMain = (event) => { event.preventDefault(); document.getElementById('contenido')?.focus(); document.getElementById('contenido')?.scrollIntoView() }
  const { id, hash } = location
  const settings = id === 'duelo' ? duelSettings(hash) : null
  return <><a className="skip-link" href="#contenido" onClick={skipToMain}>Saltar al contenido</a>{id === 'inicio' ? <Home /> : id === 'solo' ? <SoloLobby /> : id === 'multijugador' ? <MultiplayerLobby /> : id === 'solitario' ? <Solitaire /> : id === 'alta-baja' ? <HighLow /> : id === 'duelo' ? <MultiplayerDuel key={hash} {...settings} /> : id === 'carta-mayor' ? <CartaMayor /> : id === 'carta-mayor-pc' ? <CartaMayorVsPc /> : id === 'blackjack' ? <BlackJack /> : <Baccarat />}</>
}

export default App

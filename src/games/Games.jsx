import { useEffect, useState } from 'react'
import { DeckStack, GoldButton, HelpDialog, PlayerHand, ShuffleDeck, TableFelt } from '../components/Table.jsx'
import { ActionPanel, GameFrame, HelpFooter, ResultBanner } from '../components/GameShell.jsx'
import { baccaratTotal, blackjackResult, blackjackTotal, createDeck, dealerShouldDraw, highCardResult, isBlackjack, playBaccarat, shuffleDeck } from '../game/rules.js'

export function CartaMayor() {
  const [round, setRound] = useState(null)
  const [help, setHelp] = useState(false)
  const [shuffling, setShuffling] = useState(false)
  const draw = () => {
    if (shuffling) return
    const deck = shuffleDeck(createDeck())
    const player = deck[0]
    const house = deck[1]
    const outcome = highCardResult(player, house)
    setShuffling(true)
    setRound({ player, house, outcome, id: Date.now() + Math.random() })
  }
  useEffect(() => {
    if (!shuffling) return undefined
    const timer = setTimeout(() => setShuffling(false), 600)
    return () => clearTimeout(timer)
  }, [shuffling, round])
  const status = shuffling ? 'Barajando y repartiendo las dos cartas…' : !round ? 'Tu turno: revela las dos cartas.' : round.outcome === 'tie' ? 'Mismo valor. Esta ronda termina en empate.' : round.outcome === 'win' ? 'Tu carta es más alta.' : 'La carta de la casa es más alta.'
  return <GameFrame id="carta-mayor" onHelp={() => setHelp(true)} status={status} phase={shuffling ? 'dealing' : round ? 'complete' : 'ready'}>
    <nav className="mode-switch" aria-label="Modo de Carta Mayor"><a href="#carta-mayor" aria-current="page">Ronda rápida</a><a href="#carta-mayor-pc">Jugador vs PC</a></nav>
    <TableFelt key={round?.id || 'empty'} className="high-table"><div className="table-inner">
      <PlayerHand label="La casa" cards={round ? [round.house] : []} allHidden={shuffling} total={shuffling ? undefined : round?.house.rank} empty="Espera el reparto" />
      <div className="table-center"><ShuffleDeck active={shuffling}><DeckStack /></ShuffleDeck><span className="table-ornament">ROYAL TABLE</span></div>
      <PlayerHand label="Tu carta" cards={round ? [round.player] : []} allHidden={shuffling} total={shuffling ? undefined : round?.player.rank} active={!round} empty="Tu carta espera en la baraja" />
    </div></TableFelt>
    <ActionPanel title={shuffling ? 'Repartiendo' : round ? 'Ronda terminada' : 'Una carta decide la ronda'} description={shuffling ? 'Una carta para ti y otra para la casa.' : round ? 'Puedes jugar otra mano cuando quieras.' : 'El as es la carta más alta; los palos no desempatan.'}><GoldButton onClick={draw} disabled={shuffling}>{shuffling ? 'Repartiendo…' : round ? 'Jugar otra ronda' : 'Revelar cartas'} <span aria-hidden="true">→</span></GoldButton></ActionPanel>
    {round && !shuffling && <ResultBanner key={round.id} outcome={round.outcome} detail={round.outcome === 'tie' ? `Ambos sacaron ${round.player.rank}.` : `${round.player.rank} contra ${round.house.rank}.`} />}
    {help && <HelpDialog title="Cómo jugar a Carta Mayor" onClose={() => setHelp(false)}><div className="help-content"><p>Revela una carta para ti y otra para la casa. La carta de mayor valor gana la ronda.</p><ol><li>Pulsa “Revelar cartas”.</li><li>Compara los valores: 2 es la menor y as la mayor.</li><li>Si tienen el mismo valor, la ronda es empate. El palo no cambia el resultado.</li></ol><HelpFooter>Variante de Royal Table: duelo de una sola carta, sin apuestas.</HelpFooter></div></HelpDialog>}
  </GameFrame>
}

export function BlackJack() {
  const [round, setRound] = useState(null)
  const [help, setHelp] = useState(false)
  const start = () => {
    const deck = shuffleDeck(createDeck())
    const player = [deck[0], deck[2]]
    const dealer = [deck[1], deck[3]]
    const natural = isBlackjack(player) || isBlackjack(dealer)
    const outcome = natural ? blackjackResult(player, dealer) : null
    setRound({ player, dealer, deck: deck.slice(4), phase: natural ? 'complete' : 'player', outcome, id: Date.now() + Math.random() })
  }
  const hit = () => {
    setRound((current) => {
      if (current?.phase !== 'player') return current
      const player = [...current.player, current.deck[0]]
      const deck = current.deck.slice(1)
      const total = blackjackTotal(player).total
      return { ...current, player, deck, phase: total > 21 ? 'complete' : total === 21 ? 'dealer' : 'player', outcome: total > 21 ? 'lose' : null }
    })
  }
  const stand = () => setRound((current) => current?.phase === 'player' ? { ...current, phase: 'dealer' } : current)
  useEffect(() => {
    if (round?.phase !== 'dealer') return undefined
    const timer = setTimeout(() => setRound((current) => {
      if (current?.phase !== 'dealer') return current
      if (dealerShouldDraw(current.dealer) && current.deck.length) {
        return { ...current, dealer: [...current.dealer, current.deck[0]], deck: current.deck.slice(1) }
      }
      return { ...current, phase: 'complete', outcome: blackjackResult(current.player, current.dealer) }
    }), 480)
    return () => clearTimeout(timer)
  }, [round])
  const phase = round?.phase || 'ready'
  const playerTotal = round ? blackjackTotal(round.player).total : undefined
  const dealerTotal = round ? (phase === 'player' ? blackjackTotal([round.dealer[0]]).total : blackjackTotal(round.dealer).total) : undefined
  const status = phase === 'ready' ? 'Empieza la mano para recibir tus dos cartas.' : phase === 'player' ? `Tu turno: tienes ${playerTotal}. Pide otra carta o plántate.` : phase === 'dealer' ? 'Turno de la casa: revela su carta y roba hasta llegar a 17.' : 'Mano terminada. Mira el resultado y vuelve a jugar.'
  let detail = ''
  if (phase === 'complete') {
    if (isBlackjack(round.player) && isBlackjack(round.dealer)) detail = 'Ambos tienen Black Jack natural.'
    else if (isBlackjack(round.player)) detail = 'As y carta de valor 10: Black Jack natural.'
    else if (isBlackjack(round.dealer)) detail = 'La casa tiene Black Jack natural.'
    else if (playerTotal > 21) detail = `Te pasaste con ${playerTotal} puntos.`
    else if (dealerTotal > 21) detail = `La casa se pasó con ${dealerTotal} puntos.`
    else detail = `${playerTotal} frente a ${dealerTotal} de la casa.`
  }
  return <GameFrame id="blackjack" onHelp={() => setHelp(true)} status={status} phase={phase}>
    <TableFelt key={round?.id || 'empty'}><div className="table-inner">
      <PlayerHand label="La casa" cards={round?.dealer} hiddenIndex={phase === 'player' ? 1 : -1} total={dealerTotal === undefined ? undefined : phase === 'player' ? `${dealerTotal} + ?` : dealerTotal} active={phase === 'dealer'} empty="La casa aún no tiene cartas" />
      <div className="table-center"><DeckStack /><span className="table-ornament">BLACK JACK · 21</span></div>
      <PlayerHand label="Tu mano" cards={round?.player} total={playerTotal} active={phase === 'player'} empty="Reparte para empezar" />
    </div></TableFelt>
    <ActionPanel title={phase === 'player' ? 'Decide tu jugada' : phase === 'dealer' ? 'La casa está jugando' : phase === 'complete' ? 'La mano ha terminado' : 'Tu objetivo: acercarte a 21'} description={phase === 'player' ? 'Pedir añade una carta; plantarte deja jugar a la casa.' : phase === 'dealer' ? 'La casa se planta con 17 o más, incluso si el as vale 11.' : 'Si pasas de 21, pierdes. El as vale 1 u 11.'}>{phase === 'ready' ? <GoldButton onClick={start}>Repartir cartas <span aria-hidden="true">→</span></GoldButton> : phase === 'player' ? <><GoldButton onClick={hit}>Pedir carta</GoldButton><button className="secondary-button" type="button" onClick={stand}>Plantarse</button></> : phase === 'dealer' ? <GoldButton disabled>La casa juega…</GoldButton> : <GoldButton onClick={start}>Nueva mano <span aria-hidden="true">→</span></GoldButton>}</ActionPanel>
    {phase === 'complete' && <ResultBanner outcome={round.outcome} detail={detail} />}
    {help && <HelpDialog title="Cómo jugar a Black Jack" onClose={() => setHelp(false)}><div className="help-content"><p>Intenta quedar más cerca de 21 que la casa sin superar 21.</p><ol><li>Recibes dos cartas. Una de las cartas de la casa queda oculta.</li><li>“Pedir carta” suma una carta. “Plantarse” conserva tu mano y pasa el turno.</li><li>La casa revela su carta y pide hasta llegar a 17; se planta también con 17 suave.</li><li>As vale 1 u 11, figuras valen 10. As + carta de valor 10 en las primeras dos es Black Jack natural y supera a un 21 común.</li></ol><HelpFooter href="https://bicyclecards.com/how-to-play/blackjack/">Variante: una baraja nueva por mano; sin fichas, dobles, divisiones ni seguro. Un empate cuenta como tal.</HelpFooter></div></HelpDialog>}
  </GameFrame>
}

export function Baccarat() {
  const [round, setRound] = useState(null)
  const [help, setHelp] = useState(false)
  const choose = (prediction) => setRound({ ...playBaccarat(shuffleDeck(createDeck())), prediction, step: -1, phase: 'dealing', id: Date.now() + Math.random() })
  useEffect(() => {
    if (round?.phase !== 'dealing') return undefined
    const timer = setTimeout(() => setRound((current) => {
      if (!current || current.phase !== 'dealing') return current
      const nextStep = current.step + 1
      return { ...current, step: nextStep, phase: nextStep === current.timeline.length - 1 ? 'complete' : 'dealing' }
    }), 420)
    return () => clearTimeout(timer)
  }, [round])
  const visible = round?.step >= 0 ? round.timeline[round.step] : null
  const phase = round?.phase || 'ready'
  const label = { player: 'Punto', banker: 'Banco', tie: 'Empate' }
  const result = round?.prediction === round?.outcome ? 'win' : round?.outcome === 'tie' && round?.prediction !== 'tie' ? 'tie' : 'lose'
  const status = phase === 'ready' ? 'Elige tu pronóstico antes de repartir.' : phase === 'dealing' ? (visible?.message || 'Repartiendo cartas…') : `${round.outcome === 'tie' ? 'Empate entre Punto y Banco' : `Gana ${label[round.outcome]}`}. Tu elección fue ${label[round.prediction]}.`
  return <GameFrame id="baccarat" onHelp={() => setHelp(true)} status={status} phase={phase}>
    <TableFelt key={round?.id || 'empty'}><div className="table-inner">
      <PlayerHand label="Banco" cards={visible?.banker} total={visible?.banker?.length >= 2 ? baccaratTotal(visible.banker) : undefined} empty="Espera el reparto" />
      <div className="table-center"><DeckStack /><span className="table-ornament">PUNTO · BANCO</span></div>
      <PlayerHand label="Punto" cards={visible?.player} total={visible?.player?.length >= 2 ? baccaratTotal(visible.player) : undefined} empty="Espera el reparto" />
    </div></TableFelt>
    <ActionPanel title={phase === 'ready' ? '¿Qué mano quedará más cerca de 9?' : phase === 'dealing' ? 'El reparto sigue reglas fijas' : 'Ronda terminada'} description={phase === 'ready' ? 'Punto y Banco son nombres de manos, no jugadores. También puedes elegir empate.' : phase === 'dealing' ? 'La tercera carta se decide automáticamente.' : 'Elige de nuevo para la próxima ronda.'}><div className="prediction-buttons"><GoldButton onClick={() => choose('player')} disabled={phase === 'dealing'}>Punto</GoldButton><button className="secondary-button" type="button" onClick={() => choose('banker')} disabled={phase === 'dealing'}>Banco</button><button className="secondary-button" type="button" onClick={() => choose('tie')} disabled={phase === 'dealing'}>Empate</button></div></ActionPanel>
    {phase === 'complete' && <ResultBanner outcome={result} title={result === 'win' ? 'Pronóstico acertado' : result === 'tie' ? 'Empate: pronóstico nulo' : 'Pronóstico fallido'} detail={`Punto ${round.playerTotal} · Banco ${round.bankerTotal}. ${round.natural ? 'Hubo un 8 o 9 natural; no se robó una tercera carta.' : 'La tercera carta, si hizo falta, siguió la tabla de Punto Banco.'}`} />}
    {help && <HelpDialog title="Cómo jugar a Baccarat" onClose={() => setHelp(false)}><div className="help-content"><p>Predice si Punto, Banco o Empate terminará con el total más cercano a 9. Ninguna mano es “tuya”: eliges el resultado.</p><ol><li>Elige Punto, Banco o Empate antes del reparto.</li><li>As vale 1; 2–9 conservan su valor; 10 y figuras valen 0. Solo cuenta la última cifra del total.</li><li>Un 8 o 9 inicial es natural. Si no hay natural, Punto roba con 0–5 y se planta con 6–7.</li><li>Banco puede robar según su total y, si existe, la tercera carta de Punto. El juego aplica esa tabla automáticamente.</li></ol><HelpFooter href="https://www.pacodeandbulletin.gov/secure/pacode/data/058/chapter631a/s631a.11.html">Variante: Punto Banco con una baraja nueva por ronda; predicciones sin apuestas ni comisión. Si sale empate y elegiste Punto o Banco, el pronóstico queda nulo.</HelpFooter></div></HelpDialog>}
  </GameFrame>
}

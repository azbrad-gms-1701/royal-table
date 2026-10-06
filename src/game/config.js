export const GAMES = {
  'carta-mayor': { name: 'Carta Mayor', number: '01', intro: 'Tú y la casa sacan una carta. Gana la más alta.', goal: 'Saca una carta más alta que la de la casa.', variant: 'Duelo de carta alta · 1 carta por lado · as alto · empate si coinciden los valores' },
  'carta-mayor-pc': { name: 'Carta Mayor vs PC', number: '01', goal: 'Elige una de tus tres cartas para vencer a la PC.', variant: 'Variante Royal Table · 3 cartas por lado · eliges 1 · la PC juega su carta más alta · as alto · valores iguales empatan' },
  blackjack: { name: 'Black Jack', number: '02', intro: 'Pide cartas o plántate. Luego juega la casa.', goal: 'Supera a la casa sin pasar de 21.', variant: '1 baraja · casa se planta en 17, también suave · sin apuestas, dobles ni divisiones' },
  baccarat: { name: 'Baccarat', number: '03', intro: 'Predice si Punto, Banco o Empate se acercará más a 9.', goal: 'Pronostica qué mano quedará más cerca de 9.', variant: 'Punto Banco · tercera carta automática · predicción sin apuestas ni comisión' },
  solitario: { name: 'Solitario', number: '04', intro: 'Ordena las 52 cartas tú solo, sin rivales ni bots.', goal: 'Completa cuatro cimientos, del as al rey, uno por palo.', variant: 'Klondike · robo de una carta · reciclaje ilimitado · sin devolver cartas de los cimientos' },
  'alta-baja': { name: 'Alta o Baja', number: '05', intro: 'Predice la próxima carta. Solo tú y la baraja.', goal: 'Adivina si la siguiente carta será mayor o menor que la actual.', variant: 'Variante Royal Table · 1 baraja · as alto · igualdad nula · sin puntuación acumulada' },
  duelo: { name: 'Carta Mayor · Mesa compartida', number: '06', intro: 'Juega por turnos con amigos y hasta siete bots.', goal: 'Elige una de tus tres cartas; gana el valor más alto de la mesa.', variant: 'Variante Royal Table · 2 a 8 puestos · 3 cartas por puesto · as alto · valores iguales empatan' },
}

export const SOLO_GAME_IDS = ['solitario', 'alta-baja', 'carta-mayor', 'blackjack', 'baccarat']

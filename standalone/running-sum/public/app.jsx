import React from 'react'
import RunningSum, { dataFromResults } from '../src/index'

function randint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function random_choice(L) {
  return L[randint(0, L.length-1)]
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
  }

  render = () => {
    const entities = 'abcdefghijklmnopqrstuvwxyz'.split('')
    let shuffled_entities = entities
    shuffle(shuffled_entities)
    const up = shuffled_entities.slice(0, 10)
    shuffle(shuffled_entities)
    const down = shuffled_entities.slice(0, 10)
    shuffle(shuffled_entities)
    const ranks = shuffled_entities.reduce((agg, ent, ind) => ({...agg, [ent]: ind}), {})
    console.log({ up, down, ranks })
    return (
      <div>
        <RunningSum
          data={dataFromResults({
            input: {
              up,
              down,
            },
            output: {
              entities,
              ranks: entities.map(ent => ranks[ent]),
            },
          })}
        />
      </div>
    )
  }
}

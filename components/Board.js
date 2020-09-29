import * as R from "rambdax"
import React from "react"
import * as L from "../lib"
import vocabulary from "../vocabulary.json"

let allWords = R.shuffle(vocabulary)

// LOGIC ===========================================================================================
export let makeRandomWord = (seed, {xFn = null, yFn = null, xmin = 0, xmax = 100, ymin = 0, ymax = 100} = {}) => {
  seed = seed ?? R.random(xmin, xmax)
  return {
    str: L.pickRandom(allWords),
    x: xFn ? xFn(seed) : R.random(xmin, xmax),
    y: yFn ? yFn(seed) : R.random(ymin, ymax),
  }
}

export let makeRandomWords = (n, settings = {}) => {
  return R.pipe(
    () => R.range(0, n),
    R.mapIndexed((_, i) => makeRandomWord(i, settings))
  )()
}

export let hasInput = (input) => (words) => {
  return Boolean(R.find(word => word.str == input, words))
}

export let dropInput = (input) => (words) => {
  return R.filter(word => word.str != input, words)
}

export let moveWord = (word, {xmin = 1, xmax = 1, ymin = 1, ymax = 1} = {}) => {
  return {
    ...word,
    x: R.clamp(0, 100, word.x + R.random(xmin, xmax)),
    y: R.clamp(0, 100, word.y + R.random(ymin, ymax)),
  }
}

// VIEW ============================================================================================
export function BoardView({words}) {
  return <div className="board-wrapper">
    <div className="board">
      {words.map(({str, x, y}, i) => <span key={i} className="word" style={{
        left: x + "%",
        bottom: y + "%",
      }}>{str}</span>)}
    </div>
    <style jsx>{`
      .board-wrapper {
        width: 640px;
        height: 480px;
        padding: 4rem 4rem 0 4rem;
        background: #dcdcdc;
      }
      
      .board {
        position: relative;
        height: 100%;
        background: #dcdcff;
      }
      
      .word {
        text-align: center;
        position: absolute;
        background: #cd5c5c;
        border-radius: 10px;
        padding: 0 0.5rem;
      }
    `}</style>
  </div>
}

export function ScreenView({className, children}) {
  return <>
    <div className={`screen ${className}`}>
      {children}
    </div>
    <style jsx>{`
      .screen {
        display: flex;
        width: 640px;
        height: 480px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      
      :global(.screen h1) {
        font-size: 3rem;
      }
      
      .screen.green {
        background: #a8db8f;
      }
      
      .screen.gray {
        background: #dcdcdc;
      }
      
      .screen.red {
        background: #db8f8f;
      }
    `}</style>
  </>
}

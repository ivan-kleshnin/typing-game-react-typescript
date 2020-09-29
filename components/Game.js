import * as R from "rambdax"
import React, {useDeferredValue, useEffect, useState} from "react"
import * as L from "../lib"
import * as Board from "./Board"

let vocabulary = ["react", "angular", "jquery", "vue", "backbone", "svelte"]

let Status = {
  Stopped: "Stopped",
  Running: "Running",
  Won: "Won",
  Lost: "Lost",
  Paused: "Paused",
}

let startGame = (state) => ({
  words: Board.makeRandomWords(5, {xFn: (i) => i * 20, ymin: 80, ymax: 100}),
  input: "",
  secondsLeft: 60,
  status: Status.Running,
})

let dropInput = (input) => (state) => {
  return {
    ...state,
    words: Board.dropInput(input)(state.words),
    input: ""
  }
}

let hasWinningCond = (state) => !state.secondsLeft || !state.words.length

let hasLosingCond = (state) => R.find(word => !word.y, state.words)

let setInput = (input) => (state) => ({...state, input})

let setStatus = (status) => (state) => ({...state, status})

let nextTick = (state) => {
  return {
    ...state,

    // Win. Timer
    secondsLeft: Math.max(state.secondsLeft - 1, 0),

    // Gravity
    words: R.map(word => Board.moveWord(word, {xmin: -2, xmax: 2, ymin: -4, ymax: -2}), state.words),
  }
}

let addWord = (state) => {
  return {
    ...state,
    words: [...state.words, Board.makeRandomWord(null, {ymin: 80, ymax: 100})],
  }
}

export function App() {
  let [state, setState] = useState({
    ...startGame(),
    status: Status.Stopped,
  })

  let {words, input, status, secondsLeft} = state

  // INPUT HANDLING
  function handleStartingClick(i) {
    if (status != Status.Running) {
      setState(startGame)
    }
  }

  function handleKeyDown(event) {
    if (status == Status.Running) {
      if (event.keyCode === 27) {
        setState(setStatus(Status.Paused))
      } else if (event.keyCode == 13) {
        setState(setInput(""))
      } else if (event.code.startsWith("Key") || event.code.startsWith("Digit")) {
        setState(state => {
          return {
            ...state,
            input: state.input + event.key,
          }
        })
      }
    } else if (status == Status.Paused) {
      if (event.keyCode === 27) {
        setState(setStatus(Status.Running))
      }
    }
  }

  useEffect(_ => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [status])

  useEffect(() => {
    let timer = setTimeout(() => {
      setState(state => ({...state, input: ""}))
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [input])

  // WIN/LOSE MECHANICS
  useEffect(_ => {
    if (status == Status.Running) {
      if (Board.hasInput(input)(words)) {
        setState(dropInput(input))
      }
    }
  }, [words, input])

  useEffect(_ => {
    if (status == Status.Running) {
      if (hasWinningCond(state)) {
        setState(setStatus(Status.Won))
      } else if (hasLosingCond(state)) {
        setState(setStatus(Status.Lost))
      }
    }
  }, [state])

  // TIMERS
  useEffect(_ => {
    let timer = null
    if (status == Status.Running && !timer) {
      timer = setInterval(() => {
        setState(nextTick)
      }, 1000)
    }
    return () => {
      clearInterval(timer)
    }
  }, [status])

  useEffect(_ => {
    let timer = null
    if (status == Status.Running && !timer) {
      timer = setInterval(() => {
        setState(addWord)
      }, 2000)
    }
    return () => {
      clearInterval(timer)
    }
  }, [status])

  return <div onClick={handleStartingClick}>
    <ScreenBoxView status={status} words={words}/>
    <StatusLineView status={status} input={input} secondsLeft={secondsLeft}/>
  </div>
}

function ScreenBoxView({input, status, words}) {
  switch (status) {
    case Status.Running:
    case Status.Paused:
      return <Board.BoardView words={words}/>

    case Status.Stopped:
      return <Board.ScreenView className="gray">
        <div>
          <h1>Typing Game</h1>
          <p className="small" style={{textAlign:"center"}}>Click anywhere to start!</p>
        </div>
      </Board.ScreenView>

    case Status.Won:
      return <Board.ScreenView className="green">
        <div>
          <h1>Victory!</h1>
          <p className="small" style={{textAlign:"center"}}>Click anywhere to try again!</p>
        </div>
      </Board.ScreenView>

    case Status.Lost:
      return <Board.ScreenView className="red">
        <div>
          <h1>Defeat!</h1>
          <p className="small" style={{textAlign:"center"}}>Click anywhere to try again!</p>
        </div>
      </Board.ScreenView>
  }
}

function StatusLineView({status, input, secondsLeft}) {
  function LeftSide({status, input}) {
    return <>
      <div className={`left-side ${status.toLowerCase()}`}>
        {
          (_ => {
             switch (status) {
              case Status.Running: return input
              case Status.Paused:  return "..."
              default:             return "Lets Go!"
            }
          })()
        }
        <style jsx>{`
          .left-side.running::after {
            content: "|";
            top: 10px;
            font-size: 2rem;
            animation: 1s blink step-end infinite;
          }  
          @keyframes blink {
            from, to {
              color: black;
            }
            50% {
              color: transparent;
            }
          }
        `}</style>
      </div>
    </>
  }

  function RightSide({status, secondsLeft}) {
    return <>
      <div className="right-side">
        {
          (_ => {
            switch (status) {
              case Status.Running: return `Seconds left: ${secondsLeft}`
              case Status.Paused:  return "[PAUSED]"
              case Status.Lost:    return ":("
              case Status.Won:     return ":("
              case Status.Stopped: return "^_^"
              default:             throw Error(`invalid status ${status}`)
            }
          })()
        }
      </div>
    </>
  }

  return <>
    <div className="status-line">
      <LeftSide status={status} input={input}/>
      <RightSide status={status} secondsLeft={secondsLeft}/>
    </div>
    <style jsx>{`
      .status-line {
        color: gray;
        display: flex;
        justify-content: space-between;
        font-size: 1.5rem;
      }
    `}</style>
  </>
}

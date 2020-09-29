import * as R from "rambdax"

export let pickRandom = (xs) => xs[R.random(0, xs.length - 1)]

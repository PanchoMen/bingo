import _ from "lodash"

const BALLS_NUMBER = 90
const balls = generateRandomArrayNumbers()
const ball = document.getElementById('ball')
const button = document.getElementById('button')

function generateRandomArrayNumbers (min = 1, max = BALLS_NUMBER + 1) {
	return _.shuffle(_.range(min, max))
}

function createBoard (numbers = 15) {
	return generateRandomArrayNumbers().slice(0, numbers + 1)
}

function pickBall () {
	return balls.shift()
}

button.addEventListener('click', function () {
	ball.textContent = pickBall()
})

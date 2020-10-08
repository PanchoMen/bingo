import _ from 'lodash'

const BALLS_NUMBER = 90
const BOARD_ROWS_NUMBER = 3
const BOARD_DISTRIBUTION = _.shuffle([2, 2, 2, 2, 2, 2, 1, 1, 1])
const balls = generateBalls()
const ball = document.getElementById('ball')
const button = document.getElementById('button')

function generateRangeNumbers () {
  return _.range(1, BALLS_NUMBER + 1)
}

function generateBalls () {
  return _.shuffle(generateRangeNumbers())
}

function pickBall () {
  return balls.shift()
}

button.addEventListener('click', function () {
  ball.textContent = pickBall()
})

function generateRandomNumber (max = BOARD_ROWS_NUMBER) {
  return Math.floor(Math.random() * max)
}

function deleteFromRow (row, nOfElements) {
	for(let index = 0; index < nOfElements; index++) {
		row.pop()
	}
	return row
}

function generateRows () {
  let rows = []
  let start
  let end
  for (let i = 0; i < BALLS_NUMBER; i += 10) {
	if(i === 0) {
		start = 1
		end = i + 10
	} else if (i === (BALLS_NUMBER - 10)) {
		start = i
		end = i + 11
	} else {
		start = i
		end = i + 10
	}
    rows.push(_.shuffle(_.range(start, end)).slice(0, BOARD_ROWS_NUMBER))
  }
  return rows
}

function matchCardsNumber (rows) {
	let nOfEliminations = 0
	rows.forEach((row, index) => {
		nOfEliminations = BOARD_ROWS_NUMBER - BOARD_DISTRIBUTION[index]
		rows[index] = deleteFromRow(row, nOfEliminations)
	})
  return rows
}

function completeRows (rows) {
	let sortedRow
  rows.forEach((row, index) => {
    sortedRow = _.orderBy(row)
    while (sortedRow.length < BOARD_ROWS_NUMBER) {
		sortedRow.splice(generateRandomNumber(), 0, 'empty')
	}
	rows[index] = sortedRow
  })
  return rows
}

function generateBoardRows () {
  const rows = generateRows()
  /* console.log('Array inicial')
  console.log(rows) */
  const rowsWithCorrectSize = matchCardsNumber(rows)
  /* console.log('Array con agujeros')
  console.log(rowsWithCorrectSize) */
  const finalRows = completeRows(rowsWithCorrectSize)
  /* console.log('Array final')
  console.log(finalRows) */
  return finalRows
}

function createBoard (player) {
  const rows = generateBoardRows()
  let cardDiv
  let rowDiv = document.createElement('div')
  rowDiv.className = 'row'
  rows.forEach((row, i) => {
    row.forEach((number, j) => {
		cardDiv = document.createElement('div')
      if (number === 'empty') {
        cardDiv.className = `card row${i} column${j} emptyCard`
      } else {
        cardDiv.className = `card row${i} column${j} number${number}`
        cardDiv.textContent = number
      }
      rowDiv.appendChild(cardDiv)
	})
	player.appendChild(rowDiv)
	rowDiv = document.createElement('div')
	rowDiv.className = 'row'
  })
}

createBoard(document.getElementById('userBoard'))
createBoard(document.getElementById('cpuBoard'))

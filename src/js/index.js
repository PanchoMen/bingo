import _ from "lodash";

const BALLS_NUMBER = 90;
const CARD_COLUMN_NUMBER = 5;
const BOARD_ROWS_NUMBER = 3;
const BOARD_DISTRIBUTION = _.shuffle([2, 2, 2, 2, 2, 2, 1, 1, 1]);
const balls = generateBalls();
const ball = document.getElementById("ball");
const button = document.getElementById("button");
const userBoard = document.getElementById("userBoard");
const cpuBoard = document.getElementById("cpuBoard");
let takedBalls = [];
let intervalID;
let lineWin = false;

function generateRangeNumbers() {
	return _.range(1, BALLS_NUMBER + 1);
}

function generateBalls() {
	return _.shuffle(generateRangeNumbers());
}

function pickBall() {
	return balls.shift();
}

function newTurn() {
	intervalID = setInterval(() => {
		const number = pickBall();
		ball.textContent = number;
		if (ball.classList.contains("hide")) {
			ball.classList.remove("hide");
		}
		ball.style.visibility = "visible";
		takedBalls.push("" + number);
		crossCard(cpuBoard, number);
		if (!lineWin) {
			checkLineWin();
		}
		if (balls.length === 0 || checkWin()) {
			clearInterval(intervalID);
		}
	}, 3000);
}

function initBombo() {
	newTurn();
	button.textContent = "Pausar";
}

function pauseBombo(message = "Iniciar") {
	clearInterval(intervalID);
	button.textContent = message;
}

button.addEventListener("click", function () {
	if (button.textContent === "Pausar") {
		pauseBombo("Continuar");
	} else {
		initBombo();
	}
});

function generateRandomNumber(max = BOARD_ROWS_NUMBER) {
	return Math.floor(Math.random() * max);
}

function deleteFromRow(row, nOfElements) {
	for (let index = 0; index < nOfElements; index++) {
		row.pop();
	}
	return row;
}

function swapContentOfRow(array, row1, row2, column) {
	let temp = array[column][row1];
	array[column][row1] = array[column][row2];
	array[column][row2] = temp;
	temp = null;
	return array;
}

function matchCardsNumber(rows) {
	let nOfEliminations = 0;
	rows.forEach((row, index) => {
		nOfEliminations = BOARD_ROWS_NUMBER - BOARD_DISTRIBUTION[index];
		rows[index] = deleteFromRow(row, nOfEliminations);
	});
	return rows;
}

function generateRows() {
	let rows = [];
	let start;
	let end;
	for (let i = 0; i < BALLS_NUMBER; i += 10) {
		if (i === 0) {
			start = 1;
			end = i + 10;
		} else if (i === BALLS_NUMBER - 10) {
			start = i;
			end = i + 11;
		} else {
			start = i;
			end = i + 10;
		}
		rows.push(_.shuffle(_.range(start, end)).slice(0, BOARD_ROWS_NUMBER));
	}
	return rows;
}

function matchRowsCardNumber(rows) {
	let noEmptyCardsCount = [0, 0, 0];
	let noEmptyCards = [[], [], []];
	for (let column = 0; column < rows.length; column++) {
		for (let row = 0; row < rows[column].length; row++) {
			if (rows[column][row] !== "empty") {
				noEmptyCards[row].push(column);
				noEmptyCardsCount[row]++;
			}
		}
	}
	noEmptyCardsCount.forEach((value, row) => {
		noEmptyCardsCount[row] = {
			row: row,
			count: value,
		};
	});

	let row1 = noEmptyCardsCount.reduce((prev, current) =>
		prev.count > current.count ? prev : current
	);
	while (row1.count > CARD_COLUMN_NUMBER) {
		const row2 = noEmptyCardsCount.reduce((prev, current) =>
			prev.count < current.count ? prev : current
		);
		if (row2.count < CARD_COLUMN_NUMBER) {
			const candidate =
				noEmptyCards[row1.row][
					generateRandomNumber(noEmptyCards[row1.row].length)
				];
			if (!noEmptyCards[row2.row].includes(candidate)) {
				rows = swapContentOfRow(rows, row1.row, row2.row, candidate);
				_.pull(noEmptyCards[row1.row], candidate);
				noEmptyCards[row2.row].push(candidate);
				noEmptyCardsCount.forEach((rowCount) => {
					if (rowCount.row === row1.row) {
						--rowCount.count;
					}
					if (rowCount.row === row2.row) {
						++rowCount.count;
					}
				});
			}
		}
		row1 = noEmptyCardsCount.reduce((prev, current) =>
			prev.count > current.count ? prev : current
		);
	}
	return rows;
}

function completeRows(rows) {
	let sortedRow;
	rows.forEach((row, index) => {
		sortedRow = _.orderBy(row);
		while (sortedRow.length < BOARD_ROWS_NUMBER) {
			sortedRow.splice(generateRandomNumber(), 0, "empty");
		}
		rows[index] = sortedRow;
	});
	return rows;
}

function generateBoardRows() {
	const rows = generateRows();
	const matchedRows = matchCardsNumber(rows);
	const completedRows = completeRows(matchedRows);
	const finalRows = matchRowsCardNumber(completedRows);
	return finalRows;
}

function createBoard(player) {
	const rows = generateBoardRows();
	let cardDiv;
	let columnDiv = document.createElement("div");
	columnDiv.className = "column";
	rows.forEach((row, i) => {
		row.forEach((number, j) => {
			cardDiv = document.createElement("div");
			if (number === "empty") {
				cardDiv.className = `card row${j} column${i} emptyCard`;
			} else {
				cardDiv.className = `card row${j} column${i} number${number}`;
				cardDiv.textContent = number;
			}
			columnDiv.appendChild(cardDiv);
		});
		player.appendChild(columnDiv);
		columnDiv = document.createElement("div");
		columnDiv.className = "column";
	});
}

function crossCard(player, number) {
	const card = player.querySelector(`.number${number}`);
	if (card) {
		console.log(player);
		console.log(card);
		card.classList.add("cross");
	}
}

function isTakedBall(number) {
	return _.includes(takedBalls, "" + number);
}

function setClickableBoard(player) {
	const cards = player.querySelectorAll(".card");
	cards.forEach((card) => {
		card.classList.add("clickable");
		card.addEventListener("click", function () {
			if (isTakedBall(card.textContent)) {
				card.classList.add("cross");
			}
		});
	});
}

function checkALine(row) {
	let crossedCards = 0;
	row.forEach((card) => {
		if (card.classList.contains("cross")) {
			crossedCards++;
		}
	});
	return crossedCards === 5 ? true : false;
}

function checkLine(player) {
	let line = false;
	for (let row = 0; row < BOARD_ROWS_NUMBER; row++) {
		const rowCards = player.querySelectorAll(`.row${row}`);
		line = line || checkALine(rowCards);
	}
	return line;
}

function checkLineWin() {
	if (checkLine(userBoard)) {
		lineWin = true;
		pauseBombo("Continuar");
		alert("Jugador ha conseguido linea");
	}
	if (checkLine(cpuBoard)) {
		lineWin = true;
		pauseBombo("Continuar");
		alert("CPU ha conseguido linea");
	}
}

function checkPlayerWin(player) {
	const cards = player.querySelectorAll(".card");
	let crossedCards = 0;
	cards.forEach((card) => {
		if (card.classList.contains("cross")) {
			crossedCards++;
		}
	});
	return crossedCards === 15 ? true : false;
}

function checkWin() {
	let win = false;
	if (checkPlayerWin(userBoard)) {
		pauseBombo();
		ball.classList.add("hide");
		button.classList.add("hide");
		win = true;
		alert("Jugador ha ganado");
	}
	if (checkPlayerWin(cpuBoard)) {
		pauseBombo();
		win = true;
		ball.classList.add("hide");
		button.classList.add("hide");
		alert("CPU ha ganado");
	}
	return win;
}

function startGame() {
	createBoard(userBoard);
	setClickableBoard(userBoard);
	createBoard(cpuBoard);
}

startGame();

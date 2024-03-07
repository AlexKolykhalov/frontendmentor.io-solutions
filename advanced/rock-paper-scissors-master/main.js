// @ts-check

const listBtns = document.querySelectorAll('.game-btn:not(.xl)');
const bonusBtn = document.querySelector('.score button:nth-of-type(1)');
const refreshBtn = document.querySelector('.score button:nth-of-type(2)');
const rulesBtn = document.querySelector('.rules');
const dialog = document.querySelector('dialog');
const closeDialogBtn = document.querySelector('dialog button');
let score = 0;
let bonus = false;

// ************************** 1. Events *********************************//

//PWA
if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

rulesBtn?.addEventListener('click', () => {
	if (dialog) {
		/**@type {HTMLImageElement|null} */
		const img = dialog.querySelector(':scope>img');
		if (img) {
			img.src = bonus ? 'images/image-rules-bonus.svg' : 'images/image-rules.svg';
		}
		dialog.showModal();
	}
});

closeDialogBtn?.addEventListener('click', () => {
	dialog?.close();
});

bonusBtn?.addEventListener('click', () => {
	const h2 = document.querySelector('h2');
	/**@type {HTMLImageElement|null} */
	const logo = document.querySelector('.logo');
	const game = document.querySelector('.game');
	const img = bonusBtn.querySelector('img');
	bonus = !bonus;
	if (h2 && game && logo && img) {
		if (bonus) {
			bonusBtn.classList.add('bonus');
			bonusBtn.setAttribute('style', 'background: linear-gradient(to bottom, var(--clr-primary-scissors-from), var(--clr-primary-paper-from), var(--clr-primary-rock-from), var(--clr-primary-lizard-from), var(--clr-primary-spock-from));');
			img.src = 'images/king-crown-gold.svg';
			game.setAttribute('data-theme', 'bonus');
			logo.src = 'images/logo-bonus.svg';
			h2.textContent = 'Rock, Paper, Scissors, Lizard, Spock';
		}
		else {
			bonusBtn.classList.remove('bonus');
			bonusBtn.removeAttribute('style');
			img.src = 'images/king-crown-default.svg';
			game.removeAttribute('data-theme')
			logo.src = 'images/logo.svg';
			h2.textContent = 'Rock, Paper, Scissors';
		};
	}
});

refreshBtn?.addEventListener('click', () => {
	const scoreOutput = document.querySelector('.score output');
	if (scoreOutput) {
		score = 0;
		scoreOutput.textContent = score.toString();
	}
});

listBtns.forEach((item) => {
	item.addEventListener('click', () => {
		const gameButtonsSection = document.querySelector('#game_buttons');
		const resultsSection = document.querySelector('#results');
		if (gameButtonsSection && resultsSection) {
			let myPick = 'scissors';
			let housePick = 'scissors';
			gameButtonsSection.setAttribute('hidden', '');
			resultsSection.removeAttribute('hidden');
			if (item.getAttribute('data-theme') === 'paper') {
				myPick = 'paper';
			}
			if (item.getAttribute('data-theme') === 'rock') {
				myPick = 'rock';
			}
			if (item.getAttribute('data-theme') === 'lizard') {
				myPick = 'lizard';
			}
			if (item.getAttribute('data-theme') === 'spock') {
				myPick = 'spock';
			}
			const gameBtnXL = resultsSection.querySelector('.xl:not([data-theme="empty"])');
			if (gameBtnXL) {
				gameBtnXL.setAttribute('data-theme', myPick);
				const img = gameBtnXL.querySelector('img');
				if (img) {
					img.src = `images/icon-${myPick}.svg`;
					img.alt = myPick;
				}
			}
			const gameBtnXLHousePicked = resultsSection.querySelector('.xl[data-theme="empty"]');
			if (gameBtnXL && gameBtnXLHousePicked) {
				let currentIndex = 0;
				const idInterval = setInterval(() => {
					const array = bonus ? ['scissors', 'paper', 'rock', 'lizard', 'spock'] : ['scissors', 'paper', 'rock'];
					const random = Math.floor(Math.random() * array.length);
					if (random === currentIndex) {
						currentIndex = random < array.length - 1 ? random + 1 : 0;
					} else {
						currentIndex = random;
					}
					housePick = array[currentIndex];
					gameBtnXLHousePicked.setAttribute('data-theme', housePick);
					const img = gameBtnXLHousePicked.querySelector('img');
					if (img) {
						img.src = `images/icon-${housePick}.svg`;
						img.alt = housePick;
					} else {
						const img = document.createElement('img');
						img.src = `images/icon-${housePick}.svg`;
						img.alt = housePick;
						gameBtnXLHousePicked.appendChild(img);
					}

				}, 100);
				const idTimeout = setTimeout(() => {
					clearInterval(idInterval);
					clearTimeout(idTimeout);
					const blockWithResult = document.querySelector('#results>.grid>:nth-child(3)');
					if (blockWithResult) {
						const result = getResult(myPick, housePick);
						const p = document.createElement('p');
						const btn = document.createElement('button');
						p.className = 'uppercase fs-800';
						p.textContent = result;
						btn.className = 'play-again btn-theme';
						btn.textContent = 'Play again';
						blockWithResult.appendChild(p);
						blockWithResult.appendChild(btn);
						if (result === 'You win' || result === 'You lose') {
							const scoreOutput = document.querySelector('.score output');
							if (scoreOutput) {
								// score = result === 'You win' ? score + 1 : score - 1;
								// score = score < 0 ? 0 : score;
								if (result === 'You win') {
									score = score + 1;
									gameBtnXL.setAttribute('data-status', 'win');
								} else {
									score = score - 1 < 0 ? 0 : score - 1;
									gameBtnXLHousePicked.setAttribute('data-status', 'win');
								}
								scoreOutput.textContent = score.toString();
							}
						}
						btn.addEventListener('click', () => {
							resultsSection.setAttribute('hidden', '');
							gameButtonsSection.removeAttribute('hidden');
							gameBtnXLHousePicked.setAttribute('data-theme', 'empty');
							gameBtnXL.removeAttribute('data-status');
							gameBtnXLHousePicked.removeAttribute('data-status');
							const img = gameBtnXLHousePicked.querySelector('img');
							if (img) gameBtnXLHousePicked.removeChild(img);
							blockWithResult.replaceChildren();
						});
					}
				}, 800);
			}
		}
	});
});

// ************************* 2. Functions *******************************//

/**
 * @param {string} myPick 
 * @param {string} housePick 
 */
function getResult(myPick, housePick) {
	if (myPick === housePick) {
		return 'Draw';
	}
	if ((myPick === 'scissors' && (housePick === 'paper' || housePick === 'lizard')) ||
		(myPick === 'paper' && (housePick === 'rock' || housePick === 'spock')) ||
		(myPick === 'rock' && (housePick === 'lizard' || housePick === 'scissors')) ||
		(myPick === 'lizard' && (housePick === 'spock' || housePick === 'paper')) ||
		(myPick === 'spock' && (housePick === 'scissors' || housePick === 'rock'))) {
		return 'You win';
	}
	return 'You lose';
}
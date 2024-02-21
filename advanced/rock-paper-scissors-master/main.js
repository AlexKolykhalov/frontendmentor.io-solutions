// @ts-check

const listBtns = document.querySelectorAll('.game-btn');

// ************************** 1. Events *********************************//

listBtns.forEach((item) => {
    item.addEventListener('click', () => {
        const gameButtonsSection = document.querySelector('#game_buttons');
        const resultsSection = document.querySelector('#results');
        if (gameButtonsSection && resultsSection) {
            gameButtonsSection.setAttribute('hidden', '');
            resultsSection.removeAttribute('hidden');
            let pick = 'scissors';
            if (item.getAttribute('data-theme') === 'paper') {
                pick = 'paper';
            }
            if (item.getAttribute('data-theme') === 'rock') {
                pick = 'rock';
            }
            if (item.getAttribute('data-theme') === 'lizard') {
                pick = 'lizard';
            }
            if (item.getAttribute('data-theme') === 'spock') {
                pick = 'spock';
            }
            const gameBtnXL = resultsSection.querySelector('.xl:not([data-theme="empty"])');
            if (gameBtnXL) {
                gameBtnXL.setAttribute('data-theme', pick);
                const img = resultsSection.querySelector('img');
                if (img) {
                    img.src = `images/icon-${pick}.svg`;
                    img.alt = pick;
                }
            }
            const gameBtnXLHousePicked = resultsSection.querySelector('.xl[data-theme="empty"]');
            if (gameBtnXLHousePicked) {
                const idInterval = setInterval(() => {
                    console.log(Math.random());
                }, 3000);
            }
        }
    });
});

// ************************* 2. Functions *******************************//
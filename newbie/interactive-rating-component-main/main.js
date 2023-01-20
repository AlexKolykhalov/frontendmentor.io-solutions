let rating = 0;

const currentRating = document.querySelector('.current-rating');
const listCard = document.querySelectorAll('.card');
const listRating = document.querySelectorAll("button[class~='rating']");
const submitBtn = document.querySelector("button[class~='submit']");
const backBtn = document.querySelector("button[class~='backarrow']");

listRating.forEach((e) => {
    e.addEventListener('mousedown', () => {
        if (!e.classList.contains('selected')) {
            removeAllSelected();
            e.classList.add('selected');
            e.classList.add('not-hover');
            currentRating.textContent = e.textContent;
            rating = Number(e.textContent);
        } else {
            removeAllSelected();
        }
    })

    e.addEventListener('animationend', () => { 
        e.classList.remove('warning');
    });
});

submitBtn.addEventListener('click', () => {
    if (rating > 0) {
        listCard[0].classList.add('hide');
        listCard[1].classList.remove('hide');
    } else {
        warning();
    }
});

backBtn.addEventListener('click', () => {
    listCard[0].classList.remove('hide');
    listCard[1].classList.add('hide');
    removeAllSelected();
});

function removeAllSelected() {
    currentRating.textContent = '0';
    rating = 0;
    listRating.forEach((e) => {
        e.classList.remove('selected');
        e.classList.remove('not-hover');
    });
}

function warning() {
    listRating.forEach((e) => {
        e.classList.add('warning');
    });
}



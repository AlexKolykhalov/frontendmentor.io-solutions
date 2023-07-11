
// @ts-check
             
             
/**
 * @type {HTMLInputElement|null}
*/
const toggle = document.querySelector('.toggle > input[type="checkbox"]');
             
/**
 * @type {NodeListOf<HTMLDivElement>}
*/
const cards = document.querySelectorAll('.card');

// ************************** Events *********************************//

toggle?.addEventListener('click', ()=>{
    toggle.checked?monthlyPrice():annuallyPrice();
});

// ************************* 2. Functions *******************************//

function monthlyPrice(){
   cards.forEach(element => {
       const prices = element.querySelectorAll('.price'); 
       prices[0].removeAttribute('data-visible');
       prices[1].setAttribute('data-visible', 'false');
   }); 
}

function annuallyPrice(){
   cards.forEach(element => {
       const prices = element.querySelectorAll('.price'); 
       prices[0].setAttribute('data-visible', 'false');
       prices[1].removeAttribute('data-visible');
   }); 
}
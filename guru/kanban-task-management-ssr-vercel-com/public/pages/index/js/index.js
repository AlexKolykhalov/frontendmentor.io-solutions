// @ts-check

/**
 * Global variable that contains the current user's board data.
 * @type {import("../components/types.js").Board}
 */
let glob; // TODO
          // 1. try to implement reaction on changes glob variable using "new Proxy()"
          // 2. convert glob in class or const createState = () => {
          //        let state = {};
                   
          //        return {
          //            getState: () => state,
          //            setState: (newState) => {
          //                state = { ...state, ...newState };
          //            }
          //        };
          //    };

window.addEventListener("load", async () => {
  try {    
    const response = await fetch("/api/board");
    glob = await response.json();      
  } catch (error) {
    console.log("Database connection error");
  }
});

/** @type {HTMLInputElement|null} */
const toggle = document.querySelector('.toggle > input[type="checkbox"]');

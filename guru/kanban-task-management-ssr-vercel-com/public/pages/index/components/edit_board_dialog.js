// @ts-check

import { Board }        from "./board.js";
import { DynamicList }  from "./dynamic_list.js";
import { emit, getBoardData, getCurrentBoardId, insert } from "./helpers.js";

export class EditBoardDialog {
  /**
   * @param {string} title
   * @returns {string} HTML string
   */
  static template(title) {
    return `<dialog>
              <div class="column gap-l">
                <div class="row gap-m main-axis-space-between">
                  <h2>Edit board</h2>
                  <button aria-label="close"><img src="/images/svg/icon-cross.svg" alt=""></button>
                </div>
                <div class="column">
                  <label for="board_name">Board Name</label>
                  <input id="board_name" value="${title}">
                </div>
                <dynamic-list></dynamic-list>
                <button disabled>Save Changes</button>
                <button>Delete board</button>
              </div>
            </dialog>`;
  }

  /** @returns {Element} */
  static init() {
    const title = document.querySelector(`[id^=${Board.prefix}-] h2`)?.textContent;
    if (!title) throw new Error(`Can't find <section id="${Board.prefix}-"> <h2>`);
    const component = EditBoardDialog.#create(title);
    insert(
      DynamicList.init({
	title: "Board Columns",
	items: getBoardData(getCurrentBoardId()).columns.map(item => {
	  return { value: item.name, placeholder: "e.g. TODO", disabled: false }
	}),
	btnText: "+ Add New Column",
	limit: 5
      }),
      "dynamic-list",
      component
    );

    return component;
  }

  /**
   * @param {string} title
   * @returns {Element}
   */
  static #create(title) {
    const template     = document.createElement("template");
    template.innerHTML = EditBoardDialog.template(title);
    const component    = template.content.firstElementChild;
    if (!component) throw new Error("Can't create \"EditBoardDialog\" component");

    EditBoardDialog.handleEvents(component);

    return component;
  }

  /**
   * @param {Element} component
   * @returns {void}
   */
  static handleEvents(component) {
    function getDifferences() {
      /** @type {HTMLInputElement|null} */
      const input = component.querySelector("#board_name");
      const listOfColumns = component.querySelector("ul");
      if (!input)         throw new Error("Can't find <input id=\"board_name\">");
      if (!listOfColumns) throw new Error("Can't find <ul>");

      const board   = getBoardData(getCurrentBoardId());
      const columns = [...board.columns];
      
      /** @type {{id:string, name:string, columns:Array<{id:string, name:string}>}} */
      const differences = { id: board.id, name: board.name, columns: [] };

      if (input.value.trim() !== board.name) differences.name = input.value.trim();
      let matches = [];
      for (let i = 0; i < [...listOfColumns.children].length; i++) {
	const currentName = [...listOfColumns.children][i].querySelector("input")?.value.trim() ?? "";
	let created = false;
	for (let j = 0; j < columns.length; j++) {
	  console.log(`current name: ${currentName}[${i}] checking with: ${columns[j].name}[${j}]`);
	  if ([...listOfColumns.children].length === 1) {
	    if (currentName.toLowerCase() === columns[j].name.toLowerCase()) {
	      differences.columns.push({ id: `u-${columns[j].id}`, name: currentName });
	      created = true;
	      columns.splice(j, 1);
	      console.log("III update");
	      break;
	    }
	  } else {
	    if (matches.includes(currentName.toLowerCase())) {
	      differences.columns.push({ id: "", name: currentName });
	      created = true;
	      console.log("IV insert");
	      break;
	    }
	    if (currentName === columns[j].name) {
	      differences.columns.push({ id: `u-${columns[j].id}`, name: currentName });
	      matches.push(currentName.toLowerCase());
	      created = true;
	      columns.splice(j, 1);
	      console.log("I update");
	      break;
	    }
	    if (currentName.toLowerCase() === columns[j].name.toLowerCase()) {
	      for (let k = i + 1; k < [...listOfColumns.children].length; k++) {
		const nextCurrentName = [...listOfColumns.children][k].querySelector("input")?.value.trim();
		console.log(`next current name: ${nextCurrentName} checking with: ${columns[j].name}`);
		if (nextCurrentName === columns[j].name) {
		  differences.columns.push({ id: "", name: currentName });
		  created = true;
		  console.log("II insert");
		  break;
		}
	      }
	      if (!created) {
		differences.columns.push({ id: `u-${columns[j].id}`, name: currentName });
		matches.push(currentName.toLowerCase());
		created = true;
		columns.splice(j, 1);
		console.log("V update");
	      }
	      break;
	    }
	  }
	}
	if (!created) differences.columns.push({ id: "", name: currentName });
      }

      differences.columns = [
	...differences.columns,
	...columns.map(item => { return { id: `d-${item.id}` , name: item.name }; })
      ];

      return differences;
    }

    function hasDifferences() {
      /** @type {HTMLInputElement|null} */
      const input = component.querySelector("#board_name");
      const listOfColumns = component.querySelector("ul");
      if (!input)         throw new Error("Can't find <input id=\"board_name\">");
      if (!listOfColumns) throw new Error("Can't find <ul>");

      const board = getBoardData(getCurrentBoardId());

      if (input.value.trim() !== board.name) return true;

      if ([...listOfColumns.children].length !== board.columns.length) {
	return true;
      } else {
	for (let index = 0; index < [...listOfColumns.children].length; index++) {
	  const currentName = [...listOfColumns.children][index].querySelector("input")?.value.trim();
	  if (currentName !== board.columns[index].name) return true;
	}
      }

      return false;
    }

    const input = component.querySelector("#board_name");
    if (!input) throw new Error("Can't find <input id=\"board_name\">");
    input.addEventListener("input", function() {
      this.removeAttribute("style");

      if (hasDifferences()) {
	controlBtns[0].removeAttribute("disabled");
      } else {
	controlBtns[0].setAttribute("disabled", "");
      }
    });

    const controlBtns = component.querySelectorAll("dynamic-list ~ button");
    if (!controlBtns[0]) throw new Error("Can't find <dinamic-list> + <button>");
    // save btn
    controlBtns[0].addEventListener("click", async function() {
      if (!EditBoardDialog.#validation(component)) return;

      const board      = document.querySelector(`[id^="${Board.prefix}-"]`);
      const boardsList = document.querySelector(`[id^="${BoardsList.prefix}-"]`);
      if (!board)      throw new Error(`Can't find <section id="${Board.prefix}">`);
      if (!boardsList) throw new Error(`Can't find <article id="${BoardsList.prefix}-">`);

      console.log(getDifferences());
      // const data = getDifferences();

      // try {
      // 	const response = await fetch("/api/board", {
      // 	  method: "UPDATE",
      // 	  headers: {"Content-Type": "application/json"},
      // 	  body: JSON.stringify(data),
      // 	});
      // 	if (response.status === 200) {
      // 	  const updatedBoard = await response.json();
      //          addBoardData(data); // update global variable
      // 	  emit("board:update", updatedBoard, boardList);
      //          emit("board:update", updatedBoard, board);
      //          component.remove()
      // 	} else {
      // 	  console.log("DB ERROR: board update");
      // 	}
      // } catch (error) {
      // 	console.log("Internet error connection");
      // }

      // const board      = document.querySelector(`[id^="${Board.prefix}-"]`);
      // const boardsList = document.querySelector(`[id^="${BoardsList.prefix}-"]`);
      // if (!board)      throw new Error(`Can't find <section id="${Board.prefix}">`);
      // if (!boardsList) throw new Error(`Can't find <article id="${BoardsList.prefix}-">`);

      // const inputBoardName  = component.querySelector("#board_name");
      // const boardsOfColumns = component.querySelector("ul");

      // if (!inputBoardName)  throw new Error("Can't find <input id=\"board_name\">");
      // if (!boardsOfColumns) throw new Error("Can't find <ul>");

      // /** @type {import("./types.js").Board} */
      // const data = {
      // 	id: generateRandomSymbols(8),
      //   name: inputBoardName.value.trim(),
      //   columns: [...boardsOfColumns.children].map(item => {
      // 	  return {
      // 	    id: generateRandomSymbols(8),
      // 	    name: item.querySelector("input")?.value.trim() ?? "",
      // 	    tasks: []
      // 	  };
      //   })
      // };
    });

    // delete btn
    if (!controlBtns[1]) throw new Error("Can't find <dinamic-list> + <button> + <button> ");
    controlBtns[1].addEventListener("click", async function() {
      console.log("click");
    });

    const closeDialogBtn = component.querySelector('button[aria-label="close"]');
    if (!closeDialogBtn) throw new Error("Can't find <button aria-label=\"close\">");
    closeDialogBtn.addEventListener("click", () => component.remove());

    component.addEventListener("dynamic-list-item:change", () => {
      if (hasDifferences()) {
	controlBtns[0].removeAttribute("disabled");
      } else {
	controlBtns[0].setAttribute("disabled", "");
      }
    });

    component.addEventListener("dynamic-list-item:add", () => {
      if (hasDifferences()) {
	controlBtns[0].removeAttribute("disabled");
      } else {
	controlBtns[0].setAttribute("disabled", "");
      }
    });

    component.addEventListener("dynamic-list-item:remove", () => {
      if (hasDifferences()) {
	controlBtns[0].removeAttribute("disabled");
      } else {
	controlBtns[0].setAttribute("disabled", "");
      }
    });
  }

  /**
   * @param {Element} component
   * @returns {boolean}
   */
  static #validation(component) {
    const inputBoardName  = component.querySelector("#board_name");
    const listOfColumns = component.querySelector("ul");

    if (!inputBoardName)  throw new Error("Can't find <input id=\"board_name\">");
    if (!listOfColumns) throw new Error("Can't find <ul>");

    let isValid = true;

    // @ts-ignore
    if (!inputBoardName.value.trim()) { // input (must not be empty)
      inputBoardName.setAttribute("style", "border-color: red;");
      isValid = false;
    }

    [...listOfColumns.children].forEach((item) => {
      if (!item.querySelector("input")?.value.trim()) { // board of columns (must not be empty)
	item.querySelector("input")?.setAttribute("style", "border-color: red;");
	isValid = false;
      }
    });

    return isValid;
  }
}

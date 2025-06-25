// @ts-check

import { getParams, showPopUpMessage } from "../../helpers.js";

/** @typedef User
 * @property {string} avatar
 * @property {string} name
 * @property {string} email
 * @property {Array<Link>} links
 **/

/** @typedef Link
 * @property {string} id
 * @property {string} url
 **/

/** @type {User} */
let dbUserData = { avatar: "", name: "", email: "", links: [] };

/** @type {User} */
let currentUserData = { avatar: "", name: "", email: "", links: [] };

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
  dbUserData             = getUserData();
  currentUserData.avatar = dbUserData.avatar;
  currentUserData.name   = dbUserData.name;
  currentUserData.email  = dbUserData.email;
  // console.log(`(init) db: ${JSON.stringify(dbUserData, null, 2)}`);
  // console.log(`(init) current: ${JSON.stringify(currentUserData, null, 2)}`);
});

// setting event listeners for elements (Links) which comes from server
document.querySelectorAll(".user-links>li").forEach(item => setLinkEventListeners(item));

/** @type {HTMLButtonElement|null} */
const saveBtn = document.querySelector(".save-btn");
if (!saveBtn) throw new Error("Can't find .save-btn");
saveBtn.addEventListener('click', async () => {
  const clockSpinner = saveBtn.querySelector(".clock-spinner");
  const previewLink  = document.querySelector(".preview-link");
  if (!clockSpinner) throw new Error("Can'f find .clock-spinner");
  if (!previewLink)  throw new Error("Can't find .preview-link");

  try {
    // console.log(`changed user data: ${JSON.stringify(currentUserData, null, 2)}`);
    clockSpinner.removeAttribute("data-visible");
    const response = await fetch(`/api/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentUserData)
    });
    if (response.status === 200) {      
      dbUserData = await response.json();
      currentUserData.links = [];
      // console.log(`(update) db: ${JSON.stringify(dbUserData, null, 2)}`);
      // console.log(`(update) current: ${JSON.stringify(currentUserData, null, 2)}`);
      clockSpinner.setAttribute("data-visible", "false");
      showPopUpMessage("Your changes have been successfully saved!", "msg");
      saveBtn.setAttribute("disabled", "");
      previewLink.removeAttribute("style");
    }
    if (response.status === 400) {
      const error = await response.json();
      clockSpinner.setAttribute("data-visible", "false");
      showPopUpMessage(error.message);
    }
    if (response.status === 401) {
      showPopUpMessage("Session is closed. You will be redirected in 1, 2, 3...", "error", false);
      setTimeout(() => { window.location.replace("/login") }, 3000);
    }
    if (response.status === 500) {
      clockSpinner.setAttribute("data-visible", "false");
      showPopUpMessage("Internal server error");
    }
  } catch (error) {
    clockSpinner.setAttribute("data-visible", "false");
    showPopUpMessage(error.message);
  }
});

/** @type {HTMLButtonElement|null} */
const logoutBtn = document.querySelector(".logout-btn");
if (!logoutBtn) throw new Error("Can't find .logout-btn");
logoutBtn.addEventListener('click', async () => {
  const clockSpinner = logoutBtn.querySelector(".clock-spinner");
  if (!clockSpinner) throw new Error("Can'f find .clock-spinner");

  try {
    clockSpinner.removeAttribute("data-visible");
    const response = await fetch(`/api/logout`);
    if (response.status === 200) window.location.replace("/login");
  } catch (error) {
    clockSpinner.setAttribute("data-visible", "false");
    showPopUpMessage(error.message);
  }
});

/** @type {HTMLButtonElement|null} */
const addNewLinkBtn = document.querySelector(".add-new-link-btn");
if (!addNewLinkBtn) throw new Error("Can't find .add-new-link-btn");
addNewLinkBtn.addEventListener('click', async () => {
  await addNewLink();
  checkDifferences();
});

/** @type {HTMLButtonElement|null} */
const uploadImgBtn = document.querySelector(".upload-image-btn");
if (!uploadImgBtn) throw new Error("Can't find .upload-image-btn");
uploadImgBtn.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".png, .jpg, .bmp";
  input.onchange = (e) => {
    // @ts-ignore
    const file = e.target?.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    // here we tell the reader what to do when it's done reading...
    reader.onload = readerEvent => {
      const content = readerEvent.target?.result; // this is the content!
      const newImg = new Image();
      // @ts-ignore
      newImg.src = content;
      newImg.onload = _ => {
	if ((newImg.width > 1024 && newImg.height > 1024) || (file.type !== "image/jpeg"
							      && file.type !== "image/png"
							      && file.type !== "image/bmp")) {
	  reader.abort();
	  const warnings = document.querySelector(".warnings");
	  if (warnings) {
	    const sizeError   = warnings.querySelectorAll("span")[0];
	    const formatError = warnings.querySelectorAll("span")[1];
	    if (sizeError && formatError) {
	      if (newImg.width > 1024 && newImg.height > 1024) {
		sizeError.classList.add("clr-p-red");
		sizeError.classList.add("fw-semibold");
		formatError.classList.remove("clr-p-red");
		formatError.classList.remove("fw-semibold");
	      }
	      if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/bmp") {
		formatError.classList.add("clr-p-red");
		formatError.classList.add("fw-semibold");
		sizeError.classList.remove("clr-p-red");
		sizeError.classList.remove("fw-semibold");
	      }
	    }
	  }
	} else {
	  // remove warnings
	  const warnings = document.querySelector(".warnings");
	  if (warnings) {
	    const errors = warnings.querySelectorAll("span");
	    errors.forEach((item) => {
	      item.classList.remove("clr-p-red");
	      item.classList.remove("fw-semibold");
	    });
	  }
	  uploadImgBtn.style.backgroundImage = 'linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('+ content +')';
	  const textUploadImgBtn = uploadImgBtn.querySelector("span > span");
	  if (!textUploadImgBtn) throw new Error("Can't find .upload-image-btn > span > span");
	  textUploadImgBtn.textContent = "Change Image";
	  const clearImgBtn = document.querySelector(".clear-image-btn");
	  if (!clearImgBtn) throw new Error("Can't find .clear-image-btn");
	  clearImgBtn.removeAttribute("data-visible");
	  // upload mockup-avatar
	  /** @type {HTMLImageElement|null} */
	  const mockupAvatar = document.querySelector(".phone-mockup-avatar");
	  if (!mockupAvatar) throw new Error("Can't find .phone-mockup-avatar");
	  // @ts-ignore
	  mockupAvatar.src = content;
	  mockupAvatar.setAttribute("style", "object-fit: cover;");
	  // @ts-ignore
	  currentUserData.avatar = content;
	  // console.log(`User avatar after changing: ${JSON.stringify(currentUserData.avatar, null, 2)}`);
	  checkDifferences();
	}
      }
    }
  };
  input.click();
});

/** @type {HTMLButtonElement|null} */
const clearImgBtn = document.querySelector(".clear-image-btn");
if (!clearImgBtn) throw new Error("Can't find .clear-image-btn");
clearImgBtn.addEventListener("click", () => {
  clearImgBtn.setAttribute("data-visible", "false");
  /** @type {HTMLImageElement|null} */
  const mockupAvatar = document.querySelector(".phone-mockup-avatar");
  const uploadImgBtn = document.querySelector(".upload-image-btn");
  if (!mockupAvatar) throw new Error("Can't find .phone-mockup-avatar");
  if (!uploadImgBtn) throw new Error("Can't find .upload-image-btn");
  uploadImgBtn.removeAttribute('style');
  const textUploadImgBtn = uploadImgBtn.querySelector('span > span');
  if (textUploadImgBtn) textUploadImgBtn.textContent = '+ Upload Image';
  // working with mockup-avatar
  mockupAvatar.src = '/images/icons/icon-upload-image.svg';
  mockupAvatar.setAttribute('style', 'object-fit: scale-down;');
  // remove warnings
  const warnings = document.querySelector('.warnings');
  if (!warnings) throw new Error("Can't find .warnings");
  warnings.querySelectorAll('span').forEach((item) => {
    item.classList.remove('clr-p-red');
    item.classList.remove('fw-semibold');
  });

  currentUserData.avatar = "";
  // console.log(`(edit) current.avatar: ${JSON.stringify(currentUserData.avatar, null, 2)}`);
  checkDifferences();
});

/** @type {HTMLAnchorElement|null} */
const previewLink = document.querySelector('.preview-link');
if (!previewLink) throw new Error("Can't find .preview-link");
previewLink.addEventListener('click', (e) => {
  if (previewLink.hasAttribute("style")) {
    e.preventDefault();
    e.stopPropagation();
  }
});

/** @type {HTMLInputElement|null} */
const firstNameInput = document.querySelector("#first_name");
if (!firstNameInput) throw new Error("Can't find #first_name");
firstNameInput.addEventListener("input", () => {
  const mockupName = document.querySelector(".phone-mockup-name");
  if (!mockupName) throw new Error("Can't find .phone-mockup-name");
  const firstName = firstNameInput.value.trim() === "" ? "****" : firstNameInput.value.trim();
  mockupName.textContent = `${firstName} ${mockupName.textContent?.trim().split(" ")[1]}`;
  currentUserData.name = `${firstNameInput.value.trim()} ${currentUserData.name.split(" ")[1]}`;

  checkDifferences();
});

/** @type {HTMLInputElement|null} */
const lastNameInput = document.querySelector("#last_name");
if (!lastNameInput) throw new Error("Can't find #last_name");
lastNameInput.addEventListener("input", () => {
  const mockupName = document.querySelector(".phone-mockup-name");
  if (!mockupName) throw new Error("Can't find .phone-mockup-name");
  const lastName = lastNameInput.value.trim() === "" ? "****" : lastNameInput.value.trim();
  mockupName.textContent = `${mockupName.textContent?.trim().split(" ")[0]} ${lastName}`;
  currentUserData.name = `${currentUserData.name.split(" ")[0]} ${lastNameInput.value.trim()}`;

  checkDifferences();
});

/** @type {HTMLInputElement|null} */
const emailInput = document.querySelector("#email");
if (!emailInput) throw new Error("Can't find #email");
emailInput.addEventListener("input", () => {
  const mockupEmail = document.querySelector(".phone-mockup-email");
  if (!mockupEmail) throw new Error("Can't find .phone-mockup-email");
  const email = emailInput.value.trim() === "" ? "***********" : emailInput.value.trim();
  mockupEmail.textContent = email;

  currentUserData.email = emailInput.value;
  checkDifferences();
});

/**
 * Buttons "Links" and "Profile Details" in the Header
 * @type {NodeListOf<HTMLButtonElement>}
 */
const listControlBtns = document.querySelectorAll('.control-btns > button');
listControlBtns.forEach((item) => {
  item.addEventListener('click', () => {
    if (item.hasAttribute('data-status') === false) {
      const previousElement = document.querySelector('.control-btns > button[data-status]');
      if (previousElement) {
	previousElement.removeAttribute('data-status');
	item.setAttribute('data-status', 'active');
	const content = document.querySelector('section > section:not([hidden])');
	const hiddenContent = document.querySelector('section > section[hidden]');
	if (content && hiddenContent) {
	  content.setAttribute('hidden', '');
	  hiddenContent.removeAttribute('hidden');
	}
      }
    }
  });
});

// ************************* 2. Functions *******************************//

/**
 * Scrape user data from index.html page
 * @returns {User}
 */
function getUserData() {
  /** @type {HTMLButtonElement|null} */
  const uploadImgBtn   = document.querySelector(".upload-image-btn");
  /** @type {HTMLInputElement|null} */
  const firstNameInput = document.querySelector("#first_name");
  /** @type {HTMLInputElement|null} */
  const lastNameInput  = document.querySelector("#last_name");
  /** @type {HTMLInputElement|null} */
  const emailInput     = document.querySelector("#email");

  if (!uploadImgBtn)                throw new Error("Can't find .upload-image-btn");
  if (!firstNameInput)              throw new Error("Can't find #firstName");
  if (!lastNameInput)               throw new Error("Can't find #lastName");
  if (!emailInput)                  throw new Error("Can't find #email");
  if (!firstNameInput.value.trim()) throw new Error("First name is required");
  if (!lastNameInput.value.trim())  throw new Error("Last name is required");

  /** @type {User} */
  let updatedUserData = { avatar: "", name: "", email: "", links: [] };

  /** @type {string} */
  let avatar = "";
  /** @type {string} */
  let name   = "";
  /** @type {string} */
  let email  = "";
  /** @type {Link[]} */
  let links  = [];

  const matchArr = uploadImgBtn.style.backgroundImage.match(/url\(["']?([^"']*)["']?\)/);
  if (matchArr) avatar = matchArr[1];

  name = firstNameInput.value.trim() + " " +  lastNameInput.value.trim();
  email = emailInput.value.trim();
  const listOfLinks = document.querySelectorAll(".user-links > li");
  listOfLinks.forEach((item) => {
    const url   = item.querySelector("input");
    const title = item.querySelector("button span");
    if (!url)                         throw new Error("Can'f find .user-links > li input");
    if (!title || !title.textContent) throw new Error("Empty title of the select button");
    const params = getParams(title.textContent);
    links.push({ id: item.getAttribute("id") ?? "", url: params.host + url.value.trim() });
  });

  updatedUserData.avatar = avatar;
  updatedUserData.name   = name;
  updatedUserData.email  = email;
  updatedUserData.links  = links;

  return updatedUserData;
}

/**
 * Adds new <li> element to <ul class="user-links"> and
 * new <div class="phone-mockup-badge"> element to <div class="phone-mockup">
 */
async function addNewLink() {
  const addNewLinkBtn = document.querySelector(".add-new-link-btn");
  const userLinks     = document.querySelector(".user-links");
  const phoneMockup   = document.querySelector(".phone-mockup");
  if (!addNewLinkBtn) throw new Error("Can'f find .add-new-link-btn");
  if (!userLinks)     throw new Error("Can'f find .user-links");
  if (!phoneMockup)   throw new Error("Can'f find .phone-mockup");

  const defaultLink = {
    id: crypto.randomUUID(),
    number: userLinks.children.length + 1,
    url: "https://github.com",
    params: getParams("GitHub")
  };

  try {
    const template = document.createElement("template");

    const respLink = await fetch(`/pages/index/_components/link.ejs`);
    const textLink = await respLink.text();
    template.innerHTML = ejs.render(textLink, { link: defaultLink });
    const link = template.content.firstElementChild?.cloneNode(true);

    const respBadge = await fetch(`/pages/index/_components/badge.ejs`);
    const textBadge = await respBadge.text();
    template.innerHTML = ejs.render(textBadge, { link: defaultLink });
    const badge = template.content.firstElementChild?.cloneNode(true);

    userLinks.appendChild(link);
    setLinkEventListeners(link);
    phoneMockup.appendChild(badge);

    currentUserData.links.push({id: defaultLink.id, url: defaultLink.url});

    // forbid adding new links if only
    if (userLinks.children.length > 4) addNewLinkBtn.setAttribute("disabled", "");
  } catch (error) {
    showPopUpMessage(error)
  }
}

/**
 * Sets required event listeners on "Link" element's children
 * (<ul class="user-links">
 *    <li id>)
 * @param {Element} element
 */
function setLinkEventListeners(element) {
  /**
   * Remove button
   * @type {HTMLButtonElement|null}
   */
  const removeBtn = element.querySelector(".row>button");
  /**
   * Button that opens the platform selection list (<ul class="options">)
   * @type {HTMLButtonElement|null}
   */
  const selectBtn = element.querySelector(".select>button");
  /**
   * The platform selection list (<ul class="options">)
   * @type {HTMLUListElement|null}
   */
  const selectOptions = element.querySelector(".select>.options");
  /**
   * Items (platforms) of selection list (<ul class="options">)
   * @type {NodeListOf<HTMLLIElement>}
   */
  const selectOptionsLi = element.querySelectorAll(".select>.options>li");
  /**
   * @type {HTMLInputElement|null}
   */
  const input = element.querySelector("input");

  if (!removeBtn)     throw new Error("Can't find .row>button");
  if (!selectBtn)     throw new Error("Can't find .select>button");
  if (!selectOptions) throw new Error("Can't find .select>.options");
  if (!input)         throw new Error("Can't find input");

  // remove action when click "Remove" button
  removeBtn.addEventListener("click", remove);
  // mouse actions for selectBtn
  selectBtn.addEventListener('mousedown', () => {
    toggleVisibility(selectOptions);
    selectBtn.focus();
  });
  // keyboard actions for selectBtn
  selectBtn.addEventListener('keydown', (e) => {
    if (e.key === "Home" || e.key === "PageUp")   move(selectOptions, "start");
    if (e.key === "End"  || e.key === "PageDown") move(selectOptions, "end");
    if (e.key === "ArrowUp")                      move(selectOptions, "backward");
    if (e.key === "ArrowDown")                    move(selectOptions, "forward");
    if (e.key === "Enter"  ||
	(e.key === " "      && selectBtn.getAttribute("aria-expanded") === "false") ||
	(e.key === "Escape" && selectBtn.getAttribute("aria-expanded") === "true")) {
      toggleVisibility(selectOptions);
    }
    if (["Tab","F5","Shift","Control"].includes(e.key) === false) {
      e.preventDefault();
      return false;
    }
  });
  // actions when selectBtn lose focus
  selectBtn.addEventListener('blur', () => {
    if (selectBtn.getAttribute('aria-expanded') === 'true') {
      toggleVisibility(selectOptions);
      selectBtn.focus();
    }
  });
  // set selected item
  selectOptionsLi.forEach((item) => {
    item.addEventListener('mousedown', (e) => {
      //@ts-ignore
      if (e.currentTarget) setAsSelected(e.currentTarget);
    });
  });
  // input change action
  input.addEventListener("input", () => {
    // edit userData.links 'url'
    const id = element.getAttribute("id");
    if (!id) throw new Error("<li> id is empty");
    const params = getParams(selectBtn.textContent?.trim() ?? "");
    editCurrentUserDataLink({ id: id, url: params.host + input.value });
  });
}

/**
 * @param {HTMLLIElement} element The selected item from droped list of options
 * <li role="menuitem"> from <ul class="options">
 */
function setAsSelected(element) {
  /** @type {HTMLButtonElement|null|undefined} */
  const selectBtn = element.closest(".select")?.querySelector("button[id]");
  /** @type {HTMLLIElement|null|undefined} */
  const previuosItem = element.parentElement?.querySelector('[data-status="selected"]');

  if (!selectBtn)    throw new Error("Can't find button[id]");
  if (!previuosItem) throw new Error("Can't find li[data-status='selected']");

  const buttonImg         = selectBtn.querySelector('img');
  const buttonSpan        = selectBtn.querySelector('span');
  const currentTargetImg  = element.querySelector('img');
  const currentTargetText = element.querySelector('span')?.textContent;

  if (!buttonImg)         throw new Error("Can't find button[id]>img");
  if (!buttonSpan)        throw new Error("Can't find button[id]>span");
  if (!currentTargetImg)  throw new Error("Can't find li>img");
  if (!currentTargetText) throw new Error("Can't find li>span or textContent is null");

  buttonImg.src          = currentTargetImg.src;
  buttonSpan.textContent = currentTargetText;
  previuosItem.removeAttribute('data-status');
  element.setAttribute('data-status', 'selected');

  const params = getParams(currentTargetText);

  // working with input
  /** @type {HTMLInputElement|null|undefined} */
  const input = element.closest("li[id]")?.querySelector("input[id]");
  if (!input) throw new Error("Can't find input[id]");
  input.setAttribute("style", `--pad-left: ${params.offset};`);
  input.parentElement?.setAttribute("style", `--host: "${params.host}";`);
  
  // working with badge (change title and bg-color)
  const index = Number(input.getAttribute('id')?.split("_")[1]) ?? 0;
  const badge = document.querySelectorAll('.phone-mockup-badge')[index - 1];
  if (!badge) throw new Error(`Can't find badge[${index - 1}]`);
  badge.classList.remove(...badge.classList);
  badge.classList.add("phone-mockup-badge", params.bgColor, "row", "cross-axis-center", "clr-n-000", "border-radius-sm");
  badge.setAttribute("style", `--image_path: url('/images/icons/${params.whiteIcon}');`);
  badge.textContent = currentTargetText;

  // edit currentUserData.links "url" by "id"
  const id = element.closest("li[id]")?.getAttribute("id");
  if (!id) throw new Error("<li> ID is empty");
  editCurrentUserDataLink({ id: id, url: params.host + input.value });
}

/**
 * Show/Hide platform selection list (<ul class="options">)
 * @param {HTMLUListElement} ulElement
 */
function toggleVisibility(ulElement) {
  const selectBtn = ulElement.parentElement?.querySelector("button");
  if (!selectBtn) throw new Error("Can't find .select>button");

  if (selectBtn.getAttribute("aria-expanded") === "true") {
    ulElement.setAttribute("data-visible", "false");
    ulElement.setAttribute("data-position", "under");
    selectBtn.setAttribute("aria-expanded", "false");
    observerOptions.unobserve(ulElement);
    observerSelect.unobserve(selectBtn);
    // console.log(`Finish observe to ${element.id} and ${selectBtn.id}`);
  } else {
    ulElement.removeAttribute("data-visible");
    selectBtn.setAttribute("aria-expanded", "true");
    // set autoscroll to current item in options list
    const currentItem = ulElement.querySelector('li[data-status="selected"]');
    if (currentItem) {
      const index = [...ulElement.children].indexOf(currentItem);
      ulElement.scrollTo({
	top: 40 * (index - 2),
	behavior: "smooth",
      });
    }
    observerOptions.observe(ulElement);
    observerSelect.observe(selectBtn);
    // console.log(`Start observe to ${element.id} and ${selectBtn.id}`);
  }
}

/**
 * Remove button (remove <li> from <ul class="user-links">)
 */
function remove() {
  const addNewLinkBtn = document.querySelector(".add-new-link-btn");
  const userLinks     = document.querySelector(".user-links");
  const phoneMockup   = document.querySelector(".phone-mockup");
  const link          = this.closest("li[id]");
  const id            = this.closest("li[id]")?.getAttribute("id");

  if (!addNewLinkBtn) throw new Error("Can't find .add-new-link-btn");
  if (!userLinks)     throw new Error("Can't find .user-links");
  if (!phoneMockup)   throw new Error("Can't find .phone-mockup");
  if (!link)          throw new Error("Can't find <li [id]>");
  if (!id)            throw new Error("<li> id is empty");

  // remove mockup badge (+4 because we have 3 elements before mockup badges)
  phoneMockup.removeChild(
    phoneMockup.children[[...userLinks.children].indexOf(link) + 4]
  );
  // remove link
  userLinks.removeChild(link);
  // rewrite value of some attributes of the remaining links
  let index = 1;
  [...userLinks.children].forEach((child) => {
    const editableElements = child.querySelectorAll("h5, label, button[id], ul, input");
    editableElements.forEach((item) => {
      if (item.tagName === "H5") {
	item.textContent = `Link #${index}`;
      }
      if (item.tagName === "LABEL") {
	item.setAttribute("for", `input_${index}`);
      }
      if (item.tagName === "BUTTON") {
	item.setAttribute("id", `select_${index}`);
	item.setAttribute("aria-controls", `options_${index}`);
      }
      if (item.tagName === "UL") {
	item.setAttribute("id", `options_${index}`);
      }
      if (item.tagName === "INPUT") {
	item.setAttribute("id", `input_${index}`);
      }
    });
    index++;
  });
  // enable to add new links
  if (addNewLinkBtn.hasAttribute("disabled")) addNewLinkBtn.removeAttribute("disabled");

  const arr = dbUserData.links.filter(item => item.id === id);
  if (arr.length === 0) // delete from currentUserData.links because link is not in dbUserData.links
    editCurrentUserDataLink({ id: id });
  if (arr.length === 1) // edit currentUserData.links
    editCurrentUserDataLink({ id: id, url: "" });
  if (arr.length > 1) // we have two or more links with same ID
    throw new Error("Two or more links with same ID");
}

/**
 * If url" is "undefined" then remove from currentUserData.links
 * If url" is "" then remove from DB during update operation
 * @param {object} link
 * @param {string} link.id
 * @param {string} [link.url]
 */
function editCurrentUserDataLink({id, url}) {
  if (url === undefined)
    currentUserData.links = currentUserData.links.filter((item) => item.id !== id);
  else {
    const currentLink = currentUserData.links.find(item => item.id === id);
    if (currentLink) {
      currentLink.url = url;
      // remove link from currentUserData.links if after editing we have
      // identical links in currentUserData.links and dbUserData.links
      const dbLink = dbUserData.links.filter(item => item.id === id);
      if (dbLink.length > 1) throw new Error("More than one link found in dbUserData");
      if (dbLink.length === 1 && dbLink[0].url === currentLink.url) {
	currentUserData.links = currentUserData.links.filter(item => item.id !== id);
      }
    } else
      currentUserData.links.push({id: id, url: url});
  }

  checkDifferences();  
}

/**
 * If we have unsaved differences between the DB data and the current data,
 * make the "save" (.save-btn) button active but disable the "preview link" (.preview-link)
 */
function checkDifferences() {
  const saveBtn     = document.querySelector(".save-btn");
  const previewLink = document.querySelector(".preview-link");
  if (!saveBtn)     throw new Error("Can't find .save-btn");
  if (!previewLink) throw new Error("Can't find .preview-link");

  if (dbUserData.avatar !== currentUserData.avatar ||
      dbUserData.name   !== currentUserData.name   ||
      dbUserData.email  !== currentUserData.email  ||
      currentUserData.links.length > 0) {
    saveBtn.removeAttribute("disabled");
    previewLink.setAttribute("style", "cursor: default; opacity: 0.5; box-shadow: none;");
  } else {
    saveBtn.setAttribute("disabled", "");
    previewLink.removeAttribute("style");
  }
  // console.log(`(edit) current: ${JSON.stringify(currentUserData, null, 2)}`);
}

/**
 * Sets as the selected item in <ul class="options"> acccording to the direction.
 * @param {HTMLUListElement} ulElement (<ul class="options">)
 * @param {string} direction Available values are 'forward', 'backward', 'start', 'end'.
 */
function move(ulElement, direction) {
  const currentItem = ulElement.querySelector('li[data-status="selected"]');
  if (!currentItem) throw new Error("Can't find li[data-status='selected']");
  const array   = ulElement.children;
  const index   = [...array].indexOf(currentItem);
  let nextIndex = 0;
  if (direction === "forward")
    nextIndex = index + 1 > array.length - 1 ? array.length - 1 : index + 1;
  if (direction === "backward")
    nextIndex = index - 1 < 0 ? 0 : index - 1;
  if (direction === "end")
    nextIndex = array.length - 1;
  if (index !== nextIndex) {
    // autoscroll
    ulElement.scrollTo({
      top: 40 * (nextIndex - 2),
      behavior: "smooth",
    });
    //@ts-ignore
    setAsSelected(array[nextIndex]);
  }
}

const parametrs = {
  root: document.querySelector('.user-links'),
  rootMargin: '0px',
  threshold: 1.0,
};

const callbackOptions = (/** @type {any[]} */ entries) => {
  entries.forEach((entry) => {
    // console.log(`${entry.target.id} intersection is ${entry.isIntersecting}`);
    if (entry.isIntersecting === false) {
      if (entry.target.getAttribute('data-position') === 'above') {
	entry.target.setAttribute('data-position', 'under');
      } else if (entry.target.getAttribute('data-position') === 'under') {
	entry.target.setAttribute('data-position', 'above');
      }
    }
  });
};

const callbackSelect = (/** @type {any[]} */ entries) => {
  entries.forEach((entry) => {
    // console.log(`${entry.target.id} intersection is ${entry.isIntersecting}`);
    if (entry.isIntersecting === false) {
      const options = entry.target.nextElementSibling;
      if (options && options.hasAttribute('data-visible') === false) {
	toggleVisibility(options);
      }
    }
  });
};

const observerSelect  = new IntersectionObserver(callbackSelect, parametrs);
const observerOptions = new IntersectionObserver(callbackOptions, parametrs);

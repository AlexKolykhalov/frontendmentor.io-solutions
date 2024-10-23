// @ts-check

import { getLinkAttributeBySourceName, showPopUpMessage } from "../../utils/utils.js";

/**
 * @typedef { import("../../../src/types/typedefs.js").User } User
 * @typedef { import("../../../src/types/typedefs.js").Link } Link
 */

/** @type {HTMLButtonElement|null} */
const addNewLinkBtn = document.querySelector('.add-new-link-btn');

/** @type {HTMLButtonElement|null} */
const uploadImgBtn = document.querySelector('.upload-image-btn');

/** @type {HTMLButtonElement|null} */
const clearImgBtn = document.querySelector('.clear-image-btn');

/** @type {HTMLButtonElement|null} */
const saveBtn = document.querySelector('.save-btn');

/** @type {HTMLButtonElement|null} */
const logoutBtn = document.querySelector('.logout-btn');

/** @type {HTMLButtonElement|null} */
const closeDialogBtn = document.querySelector('dialog button');

/** @type {NodeListOf<HTMLButtonElement>} */
const listControlBtns = document.querySelectorAll('.control-btns > button');

/** @type {HTMLAnchorElement|null} */
const previewLink = document.querySelector('.preview-link');

/** @type {HTMLInputElement|null} */
const firstNameInput = document.querySelector('#first_name');

/** @type {HTMLInputElement|null} */
const lastNameInput = document.querySelector('#last_name');

/** @type {HTMLInputElement|null} */
const emailInput = document.querySelector('#email');

/** @type {string} */
const url = (window.location.hostname === "localhost") ?
      "http://localhost:3000" :
      "https://frontendmentor-io-solutions.vercel.app";

/** @type {User|null} */
let user;

// ************************** 1. Events *********************************//

window.addEventListener('load', async () => {
    try {
	const accessToken = localStorage.getItem("_t1");
	if (!accessToken) location.replace("/login");
	const response = await fetch(`${url}/api/user`,
	    {
		method: "GET",
		headers: {"Authorization": `Bearer ${accessToken}`},
	    }
	);
	if (response.status === 200) {
	    user = await response.json();
	    console.log(`User data: ${JSON.stringify(user, null, 2)}`);
	    if (user) populateUI(user); else showPopUpMessage("User has been deleted");
	}
	if (response.status === 401) {
	    const refreshResponse = await fetch(`${url}/api/refresh`);
	    if (refreshResponse.status === 200) {
		const token = await refreshResponse.json();
		localStorage.setItem("_t1", token); // accessToken
		const response = await fetch(`${url}/api/user`,
		    {
			method: "GET",
			headers: {"Authorization": `Bearer ${token}`},
		    }
		);
		if (response.status === 200) {
		    user = await response.json();
		    console.log(`User data after resfresh: ${JSON.stringify(user, null, 2)}`);
		    if (user) populateUI(user); else showPopUpMessage("User has been deleted");
		}
		if (response.status === 500) showPopUpMessage("Internal server error");
	    }
	    if (refreshResponse.status === 401) window.location.replace("/login");
	}
	if (response.status === 500) showPopUpMessage("Internal server error");
    } catch (error) {
	showPopUpMessage("Internal server error");
    }
});

saveBtn?.addEventListener('click', async () => {
    try {
	const accessToken = localStorage.getItem("_t1");
	if (!accessToken) window.location.replace("/login");
	const changedUserData = getChangedUserData();
	console.log(`changed user data: ${JSON.stringify(changedUserData, null, 2)}`);
	saveBtn.querySelector(".clock-spinner")?.removeAttribute("data-visible");
	const response = await fetch(`${url}/api/user/update`,
	    {
		method: "POST",
		headers: {
		    "Content-Type": "application/json",
		    "Authorization": `Bearer ${accessToken}`
		},
		body: JSON.stringify(changedUserData)
	    }
	);
	if (response.status === 200) {
	    user = await response.json();
	    console.log(`User updated data: ${JSON.stringify(user, null, 2)}`);
	    saveBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
	    showPopUpMessage('Your changes have been successfully saved!', "msg");
	}
	if (response.status === 400) {
	    const error = await response.json();
	    saveBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
	    showPopUpMessage(error.message);
	}
	if (response.status === 401) {
	    const refreshResponse = await fetch(`${url}/api/refresh`);
	    if (refreshResponse.status === 200) {
		const token = await refreshResponse.json();
		localStorage.setItem("_t1", token); // accessToken
		const response = await fetch(`${url}/api/user/update`,
		    {
			method: "POST",
			headers: {
			    "Content-Type": "application/json",
			    "Authorization": `Bearer ${token}`
			},
			body: JSON.stringify(changedUserData)
		    }
		);
		if (response.status === 200) {
		    user = await response.json();
		    console.log(`User updated data after resfresh: ${JSON.stringify(user, null, 2)}`);
		    saveBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
		    showPopUpMessage('Your changes have been successfully saved!', "msg");
		}
		if (response.status === 400) {
		    const error = await response.json();
		    saveBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
		    showPopUpMessage(error.message);
		}
		if (response.status === 500) {
		    saveBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
		    showPopUpMessage("Internal server error");
		}
	    }
	    if (refreshResponse.status === 401) window.location.replace("/login");
	}
	if (response.status === 500) {
	    saveBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
	    showPopUpMessage("Internal server error");
	}
    } catch (error) {
	saveBtn.querySelector(".clock-spinner")?.setAttribute("data-visible", "false");
	showPopUpMessage(error.message);
    }
});

logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem("_t1"); // accessToken
    window.location.replace("/login");
});

addNewLinkBtn?.addEventListener('click', () => {
    const link = {
	linkId: crypto.randomUUID(),
	source: "GitHub",
	url: "",
    };
    addNewLinkAndMockupBadge(link);
});

uploadImgBtn?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png, .jpg, .bmp';
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
		if ((newImg.width > 1024 && newImg.height > 1024) || (file.type !== 'image/jpeg'
								      && file.type !== 'image/png'
								      && file.type !== 'image/bmp')) {
		    reader.abort();
		    const warnings = document.querySelector('.warnings');
		    if (warnings) {
			const sizeError   = warnings.querySelectorAll('span')[0];
			const formatError = warnings.querySelectorAll('span')[1];
			if (sizeError && formatError) {
			    if (newImg.width > 1024 && newImg.height > 1024) {
				sizeError.classList.add('clr-p-red');
				sizeError.classList.add('fw-semibold');
				formatError.classList.remove('clr-p-red');
				formatError.classList.remove('fw-semibold');
			    }
			    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/bmp') {
				formatError.classList.add('clr-p-red');
				formatError.classList.add('fw-semibold');
				sizeError.classList.remove('clr-p-red');
				sizeError.classList.remove('fw-semibold');
			    }
			}
		    }
		} else {
		    // remove warnings
		    const warnings = document.querySelector('.warnings');
		    if (warnings) {
			const errors = warnings.querySelectorAll('span');
			errors.forEach((item) => {
			    item.classList.remove('clr-p-red');
			    item.classList.remove('fw-semibold');
			});
		    }
		    uploadImgBtn.style.backgroundImage = 'linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('+ content +')';
		    const textUploadImgBtn = uploadImgBtn.querySelector('span > span');
		    if (textUploadImgBtn) textUploadImgBtn.textContent = 'Change Image';
		    if (clearImgBtn) clearImgBtn.removeAttribute('data-visible');
		    // upload mockup-avatar
		    /** @type {HTMLImageElement|null} */
		    const mockupAvatar = document.querySelector('.phone-mockup-avatar');
		    if (mockupAvatar) {
			// @ts-ignore
			mockupAvatar.src = content;
			mockupAvatar.setAttribute('style', 'object-fit: cover;');
		    }
		}
	    }
	}
    };
    input.click();
});

clearImgBtn?.addEventListener('click', () => {
    clearImgBtn.setAttribute('data-visible', 'false');
    /** @type {HTMLImageElement|null} */
    const mockupAvatar = document.querySelector('.phone-mockup-avatar');
    if (uploadImgBtn && mockupAvatar) {
	uploadImgBtn.removeAttribute('style');
	const textUploadImgBtn = uploadImgBtn.querySelector('span > span');
	if (textUploadImgBtn) textUploadImgBtn.textContent = '+ Upload Image';
	// working with mockup-avatar
	mockupAvatar.src = 'client/images/icons/icon-upload-image.svg';
	mockupAvatar.setAttribute('style', 'object-fit: scale-down;');
	// remove warnings
	const warnings = document.querySelector('.warnings');
	if (warnings) {
	    const errors = warnings.querySelectorAll('span');
	    errors.forEach((item) => {
		item.classList.remove('clr-p-red');
		item.classList.remove('fw-semibold');
	    });
	}
    }
});

closeDialogBtn?.addEventListener('click', () => {
    const dialog = document.querySelector('dialog');
    if (dialog) dialog.close();
});

previewLink?.addEventListener('click', (e) => {
    const changedUserData = getChangedUserData();    
    console.log(`changed user data: ${JSON.stringify(changedUserData, null, 2)}`);
    const arr1 = changedUserData;
    const arr2 = user ?? {userId: "", avatar: "", name: "", email: "", links: []};
    if (arr1.userId       !== arr2.userId ||
	arr1.avatar       !== arr2.avatar ||
	arr1.name         !== arr2.name   ||
	arr1.email        !== arr2.email  ||
	arr1.links.length !== 0) {
	e.preventDefault();
	e.stopPropagation();
	const dialog = document.querySelector('dialog');
	if (dialog) dialog.showModal();
    }
});

firstNameInput?.addEventListener('input', () => {
    const mockupName = document.querySelector('.phone-mockup-name');
    if (mockupName) {
	const firstName = firstNameInput.value.trim() === '' ? '****' : firstNameInput.value.trim();
	mockupName.textContent = `${firstName} ${mockupName.textContent?.split(' ')[1]}`;
    }
});

lastNameInput?.addEventListener('input', () => {
    const mockupName = document.querySelector('.phone-mockup-name');
    if (mockupName) {
	const lastName = lastNameInput.value.trim() === '' ? '****' : lastNameInput.value.trim();
	mockupName.textContent = `${mockupName.textContent?.split(' ')[0]} ${lastName}`;	
    }
});

emailInput?.addEventListener('input', () => {
    const mockupEmail = document.querySelector('.phone-mockup-email');
    if (mockupEmail) {
	const email = emailInput.value.trim() === '' ? '***********' : emailInput.value.trim();
	mockupEmail.textContent = email;	
    }
});

// 'Links' and 'Profile Details' buttons
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

// popUpMessage?.addEventListener('animationend', () => {
//     popUpMessage.removeAttribute('animated');
// }, false);

// ************************* 2. Functions *******************************//

/**
 * @param {User} data
 */
function populateUI(data) {
    // enable disabled elements
    const disabledElements = document.querySelectorAll('[disabled], .preview-link[data-visible="false"]');
    disabledElements.forEach((item) => {
	item.removeAttribute("disabled");
	item.removeAttribute("data-visible");
    });
    // fill in part of the Phone Mockup
    /** @type {HTMLImageElement|null} */
    const phoneMockupAvatar = document.querySelector(".phone-mockup-avatar");
    const phoneMockupName   = document.querySelector(".phone-mockup-name");
    const phoneMockupEmail  = document.querySelector(".phone-mockup-email");
    if (phoneMockupAvatar && phoneMockupName && phoneMockupEmail) {
	if (data.avatar) {
	    phoneMockupAvatar.src = data.avatar;
	    phoneMockupAvatar.setAttribute("style", "object-fit: cover;");
	} else {
	    phoneMockupAvatar.setAttribute("style", "object-fit: scale-down;");
	}
	phoneMockupName.textContent  = data.name;
	phoneMockupEmail.textContent = data.email ? data.email : "***********";
    }
    // add Links and Phone mockup badges
    data.links.forEach((item) => {
	// REFACTORING on two separate
	// fn addNewLink and addMockupBadge
	addNewLinkAndMockupBadge(item);
    });
    // fill in the Profile Details
    /** @type {HTMLButtonElement|null} */
    const uploadImgBtn = document.querySelector(".upload-image-btn");
    const clearImgBtn  = document.querySelector(".clear-image-btn");
    /** @type {HTMLInputElement|null} */
    const firstName    = document.querySelector("#first_name");
    /** @type {HTMLInputElement|null} */
    const lastName     = document.querySelector("#last_name");
    /** @type {HTMLInputElement|null} */
    const email        = document.querySelector("#email");
    if (uploadImgBtn && clearImgBtn && firstName && lastName && email) {
	if (data.avatar) {
	    uploadImgBtn.style.backgroundImage = `linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url("${data.avatar}")`;
	    const textUploadImgBtn = uploadImgBtn.querySelector("span > span");
	    if (textUploadImgBtn) textUploadImgBtn.textContent = "Change Image";
	    clearImgBtn.removeAttribute("data-visible");
	}
	firstName.value = data.name.split(" ")[0];
	lastName.value  = data.name.split(" ")[1];
	email.value     = data.email;
    }
}

/**
 * Scrape user data from index.html page
 */
function getChangedUserData() {
    /** @type {HTMLButtonElement|null} */
    const uploadImgBtn = document.querySelector(".upload-image-btn");
    /** @type {HTMLInputElement|null} */
    const firstName    = document.querySelector("#first_name");
    /** @type {HTMLInputElement|null} */
    const lastName     = document.querySelector("#last_name");
    /** @type {HTMLInputElement|null} */
    const email        = document.querySelector("#email");
    const userLinks    = document.querySelector(".user-links");

    if (!user) throw new Error("Empty user data");
    if (!uploadImgBtn || !firstName || !lastName || !email || !userLinks)
	throw new Error("Can't find some element");
    if (firstName.value.trim() === "") throw new Error("First name is required");
    if (lastName.value.trim() === "") throw new Error("Last name is required");
    /** @type {User} */
    let updatedUserData = {
	userId: user.userId,
	avatar: "",
	name: "",
	email: "",
	links: []
    };
    /** @type {string} */
    let avatar = "";
    /** @type {string} */
    let name   = "";
    /** @type {string} */
    let eMail  = "";
    /** @type {Link[]} */
    let links  = [];
    const bgImage = uploadImgBtn.style.backgroundImage;
    if (bgImage) {
	const matchArr = bgImage.match(/url\(["']?([^"']*)["']?\)/);
	if (matchArr) avatar = matchArr[1];
    }
    name = firstName.value.trim() + " " +  lastName.value.trim();
    eMail = email.value.trim();
    const listOfLinks = document.querySelectorAll(".user-links > li");
    listOfLinks.forEach((item) => {
	const source = item.querySelector(".select > button span");
	const url    = item.querySelector("input");
	if (source && url) {
	    if (!url.value.trim()) throw Error("Link without URL");
	    const link = {
		linkId: item.getAttribute("id") ?? "",
		source: source.textContent?.trim() ?? "",
		url: url.value.trim()
	    };
	    links.push(link);
	}
    });

    // uptading links data
    const originArray = user.links;
    const currentArray = links;
    /** @type {Link[]} */
    let updatedArray = [];

    for (const item of originArray) {
	let deleted = true;
	for (const item2 of currentArray) {
	    // update
	    if (item.linkId === item2.linkId) {
		deleted = false;
		if (item.source !== item2.source || item.url !== item2.url)
		    updatedArray.push(item2);
	    }
	}
	// delete
	if (deleted) updatedArray.push({linkId: item.linkId, source: "", url: ""})
    }

    for (const item of currentArray) {
	let created = true;
	for (const item2 of originArray) {
	    if (item.linkId === item2.linkId) {
		created = false;
		break;
	    }
	}
	if (created) updatedArray.push(item);
    }

    updatedUserData.avatar = avatar;
    updatedUserData.name   = name;
    updatedUserData.email  = eMail;
    updatedUserData.links  = updatedArray;

    return updatedUserData;
}

/**
 * @param {Link} linkInfo
 */
function addNewLinkAndMockupBadge(linkInfo) {
    const parentDiv = document.querySelector(".user-links");
    const template  = document.querySelector("#template_new_link");
    if (parentDiv && template) {
	// @ts-ignore
	const clone = template.content.firstElementChild?.cloneNode(true);
	if (clone) {
	    const total = parentDiv.querySelectorAll(":scope>li");

	    const title         = clone.querySelector("h5");
	    const removeBtn     = clone.querySelector(".row>button");
	    const selectBtn     = clone.querySelector(".select>button");
	    const selectOptions = clone.querySelector(".select>.options");
	    const labelForInput = clone.querySelector(".column>label");
	    const input         = clone.querySelector("input");

	    if (title &&
		removeBtn &&
		selectBtn &&
		selectOptions &&
		labelForInput &&
		input) {

		const index = total.length + 1;

		title.textContent = `Link #${index}`;
		selectBtn.setAttribute('id', `select_${index}`);
		selectBtn.setAttribute('aria-controls', `options_${index}`);
		selectOptions.setAttribute('id', `options_${index}`);
		labelForInput.setAttribute('for', `input_${index}`);
		input.value = linkInfo.url;
		input.setAttribute('id', `input_${index}`);

		selectBtn.addEventListener('mousedown', () => {
		    toggleOptions(selectOptions);
		    selectBtn.focus();
		});

		selectBtn.addEventListener('keydown', (e) => {
		    moveOptionsItem(selectOptions, e);
		});

		selectBtn.addEventListener('blur', () => {
		    if (selectBtn.getAttribute('aria-expanded') === 'true') {
			toggleOptions(selectOptions);
			selectBtn.focus();
		    }
		});

		const selectOptionsLi = clone.querySelectorAll('.select>.options>li');
		selectOptionsLi.forEach((item) => {
		    // set platform
		    const sourceName = item.querySelector('span');
		    if (sourceName && sourceName.textContent === linkInfo.source) {
			setSelectedItem(selectOptions, item);
		    }
		    item.addEventListener('mousedown', (e) => {
			if (e.currentTarget) setSelectedItem(selectOptions, e.currentTarget);
		    });
		});

		removeBtn.addEventListener("click", () => {
		    // remove correct badge
		    const linkIndex = [...parentDiv.children].indexOf(clone);
		    const phoneMockup = document.querySelector(".phone-mockup");
		    if (phoneMockup) {
			phoneMockup.removeChild(phoneMockup.children[linkIndex + 4]);
		    }
		    // remove link from User Links
		    parentDiv.removeChild(clone);
		    // rewrite value of some attributes of the remaining links
		    let index = 1;
		    [...parentDiv.children].forEach((child) => {
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
		    // we allow to add new links
		    if (addNewLinkBtn?.hasAttribute("disabled")) addNewLinkBtn?.removeAttribute("disabled");
		});
		// we forbit adding new links
		if (index > 4) addNewLinkBtn?.setAttribute("disabled", "");
		if (linkInfo.linkId) clone.setAttribute("id", linkInfo.linkId);
		parentDiv?.appendChild(clone);
	    }
	}
    }

    // add phone-mockup-badge
    const phoneMockup = document.querySelector('.phone-mockup');
    if (phoneMockup) {
	const badge = document.createElement('div');
	let path    = getLinkAttributeBySourceName(linkInfo.source).path;
	let bgColor = getLinkAttributeBySourceName(linkInfo.source).bgcolor;
	badge.classList.add('phone-mockup-badge', bgColor, 'row', 'cross-axis-center', 'clr-n-000', 'border-radius-sm');
	badge.setAttribute('style', `--image_path: url(${path});`);
	badge.textContent = linkInfo.source;
	phoneMockup.appendChild(badge);
    }
}

/**
 * Moves the item selection in the list of options.
 * @param {Element|null} optionElement
 * @param {KeyboardEvent} event
 */
function moveOptionsItem(optionElement, event) {
    if (optionElement && optionElement.parentElement) {
	const selectBtn = optionElement.parentElement.querySelector('button');
	if (selectBtn) {
	    if (event.key === 'Home' || event.key === 'PageUp')   move(optionElement, 'start');
	    if (event.key === 'End'  || event.key === 'PageDown') move(optionElement, 'end');
	    if (event.key === 'ArrowUp')   		          move(optionElement, 'backward');
	    if (event.key === 'ArrowDown') 		          move(optionElement, 'forward');
	    if (event.key === 'Enter'  ||
		(event.key === ' '      && selectBtn.getAttribute('aria-expanded') === 'false') ||
		(event.key === 'Escape' && selectBtn.getAttribute('aria-expanded') === 'true')) {
		toggleOptions(optionElement);
	    }
	    if (['Tab','F5','Shift','Control'].includes(event.key) === false) {
		event.preventDefault();
		return false;
	    }
	}
    }
}

/**
 * @param {Element|null} optionElement
 * @param {Element} item
 */
function setSelectedItem(optionElement, item) {
    if (optionElement && optionElement.parentElement) {
	const selectBtn    = optionElement.parentElement.querySelector('button');
	const previuosItem = optionElement.querySelector('li[data-status="selected"]');
	if (selectBtn && previuosItem) {
	    const buttonImg         = selectBtn.querySelector('img');
	    const buttonSpan        = selectBtn.querySelector('span');
	    const currentTargetImg  = item.querySelector('img');
	    const currentTargetSpan = item.querySelector('span');
	    if (buttonImg && buttonSpan && currentTargetImg && currentTargetSpan) {
		buttonImg.src          = currentTargetImg.src;
		buttonSpan.textContent = currentTargetSpan.textContent;
		previuosItem.removeAttribute('data-status');
		item.setAttribute('data-status', 'selected');
		// working with badge (change title and bg-color)
		const attr = selectBtn.getAttribute('id');
		if (attr) {
		    const index = Number(attr.split('_')[1]);
		    const phoneMockupBadges = document.querySelectorAll('.phone-mockup-badge');
		    const badge = phoneMockupBadges[index - 1];
		    if (badge && currentTargetSpan.textContent) {
			const path    = getLinkAttributeBySourceName(currentTargetSpan.textContent).path;
			const bgColor = getLinkAttributeBySourceName(currentTargetSpan.textContent).bgcolor;
			badge.classList.remove(...badge.classList);
			badge.classList.add('phone-mockup-badge', bgColor, 'row', 'cross-axis-center', 'clr-n-000', 'border-radius-sm');
			badge.setAttribute('style', `--image_path: url(${path});`);
			badge.textContent = currentTargetSpan.textContent;
		    }
		}
	    }
	}
    }
}

/**
 * Open/Close `options` at the `select`.
 * @param {Element|null} optionsElement
 */
function toggleOptions(optionsElement) {
    if (optionsElement && optionsElement.parentElement) {
	const selectBtn = optionsElement.parentElement.querySelector('button');

	if (selectBtn && optionsElement) {
	    if (selectBtn.getAttribute('aria-expanded') === 'true') {
		optionsElement.setAttribute('data-visible', 'false');
		optionsElement.setAttribute('data-position', 'under');
		selectBtn.setAttribute('aria-expanded', 'false');

		observerOptions.unobserve(optionsElement);
		observerSelect.unobserve(selectBtn);
		// console.log(`Finish observe to ${optionsElement.id} and ${selectBtn.id}`);
	    } else {
		optionsElement.removeAttribute('data-visible');
		selectBtn.setAttribute('aria-expanded', 'true');
		// set autoscroll to current item in options list
		const currentItem = optionsElement.querySelector('li[data-status="selected"]');
		if (currentItem) {
		    const index = [...optionsElement.children].indexOf(currentItem);
		    optionsElement.scrollTo({
			top: 40 * (index - 2),
			behavior: "smooth",
		    });
		}

		observerOptions.observe(optionsElement);
		observerSelect.observe(selectBtn);
		// console.log(`Start observe to ${optionsElement.id} and ${selectBtn.id}`);
	    }
	}
    }
}

/**
 * @param {Element|null} optionsElement
 * @param {string} direction Available values are 'forward', 'backward', 'start', 'end'.
 */
function move(optionsElement, direction) {
    if (optionsElement) {
	const currentItem = optionsElement.querySelector('li[data-status="selected"]');
	if (currentItem) {
	    const array = optionsElement.children;
	    const index = [...array].indexOf(currentItem);
	    let nextIndex = 0;
	    if (direction === 'forward') nextIndex = index + 1 > array.length - 1 ? array.length - 1 : index + 1;
	    if (direction === 'backward') nextIndex = index - 1 < 0 ? 0 : index - 1;
	    if (direction === 'end') nextIndex = array.length - 1;
	    if (index !== nextIndex) {
		// autoscroll
		optionsElement.scrollTo({
		    top: 40 * (nextIndex - 2),
		    behavior: 'smooth',
		});
		setSelectedItem(optionsElement, array[nextIndex]);
	    }
	}
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
		toggleOptions(options);
	    }
	}
    });
};

const observerSelect  = new IntersectionObserver(callbackSelect, parametrs);
const observerOptions = new IntersectionObserver(callbackOptions, parametrs);

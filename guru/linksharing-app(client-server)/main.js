// @ts-check

/** @type {HTMLButtonElement|null} */
const addNewLinkBtn = document.querySelector('.add-new-link-btn');

/** @type {HTMLButtonElement|null} */
const uploadImgBtn = document.querySelector('.upload-image-btn');

/** @type {HTMLButtonElement|null} */
const clearImgBtn = document.querySelector('.clear-image-btn');

/** @type {HTMLButtonElement|null} */
const saveBtn = document.querySelector('.save-btn');

/** @type {HTMLButtonElement|null} */
const signupBtn = document.querySelector('.signup-btn');

/** @type {HTMLButtonElement|null} */
const loginBtn = document.querySelector('.login-btn');

/** @type {HTMLButtonElement|null} */
const logoutBtn = document.querySelector('.logout-btn');

/** @type {HTMLButtonElement|null} */
const closeDialogBtn = document.querySelector('dialog button');

/** @type {NodeListOf<HTMLButtonElement>} */
const listControlBtns = document.querySelectorAll('.control-btns > button');

/** @type {HTMLDivElement|null} */
const popUpMessage = document.querySelector('.pop-up-message');

/** @type {HTMLAnchorElement|null} */
const previewLink = document.querySelector('.preview-link');

/** @type {HTMLInputElement|null} */
const firstNameInput = document.querySelector('#first_name');

/** @type {HTMLInputElement|null} */
const lastNameInput = document.querySelector('#last_name');

/** @type {HTMLInputElement|null} */
const emailInput = document.querySelector('#email');

// ************************** 1. Events *********************************//

window.addEventListener('load', () => {
    const json = localStorage.getItem('info');
    if (json) {
	const data        = JSON.parse(json);
	const url         = window.location;
	const destination = url.pathname.substring(url.pathname.lastIndexOf('/'), url.pathname.length);
	if (destination === '/index.html') {
	    // fill in part of the Phone Mockup
	    /** @type {HTMLImageElement|null} */
	    const phoneMockupAvatar = document.querySelector('.phone-mockup-avatar');
	    const phoneMockupName   = document.querySelector('.phone-mockup-name');
	    const phoneMockupEmail  = document.querySelector('.phone-mockup-email');
	    if (phoneMockupAvatar && phoneMockupName && phoneMockupEmail) {
		if (data.avatar) {
		    phoneMockupAvatar.src = data.avatar;
		    phoneMockupAvatar.setAttribute('style', 'object-fit: cover;');
		} else {
		    phoneMockupAvatar.setAttribute('style', 'object-fit: scale-down;');
		}
		phoneMockupName.textContent  = data.name;
		phoneMockupEmail.textContent = data.email ? data.email : '***********';
	    }
	    // add Links and Phone mockup badges
	    data.links.forEach((item) => {
		addNewLinkAndMockupBadge(item);
	    });
	    // fill in the Profile Details
	    /** @type {HTMLButtonElement|null} */
	    const uploadImgBtn = document.querySelector('.upload-image-btn');
	    const clearImgBtn  = document.querySelector('.clear-image-btn');
	    /** @type {HTMLInputElement|null} */
	    const firstName    = document.querySelector('#first_name');
	    /** @type {HTMLInputElement|null} */
	    const lastName     = document.querySelector('#last_name');
	    /** @type {HTMLInputElement|null} */
	    const email        = document.querySelector('#email');
	    if (uploadImgBtn && clearImgBtn && firstName && lastName && email) {
		if (data.avatar) {
		    uploadImgBtn.style.backgroundImage = 'linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('+ data.avatar +')';
		    const textUploadImgBtn = uploadImgBtn.querySelector('span > span');
		    if (textUploadImgBtn) textUploadImgBtn.textContent = 'Change Image';
		    clearImgBtn.removeAttribute('data-visible');
		}
		firstName.value = data.name.split(' ')[0];
		lastName.value  = data.name.split(' ')[1];
		email.value     = data.email;
	    }
	}

	if (destination === '/preview.html') {
	    const previewCard  = document.querySelector('.preview-card');
 	    if (previewCard) {
		const avatar    = previewCard.querySelector('img');
		const cardName  = previewCard.querySelectorAll('p')[0];
		const cardEmail = previewCard.querySelectorAll('p')[1];
		const cardLinks = previewCard.querySelector('ul');
		if (avatar && cardName && cardEmail && cardLinks) {
		    if (data.avatar) {
			avatar.src = data.avatar;
			avatar.setAttribute('style', 'object-fit: cover;');
		    } else {
			avatar.setAttribute('style', 'object-fit: scale-down;');
		    }
		    cardName.textContent  = data.name;
		    cardEmail.textContent = data.email ? data.email : '***********';
		    cardLinks.innerHTML   = createListOfPreviewLinks(data.links);
		}
	    }
	}
    }
});

saveBtn?.addEventListener('click', () => {
    try {
	const data = scrapeData();
	localStorage.setItem('info', JSON.stringify(data));
	showPopUpMessage('Your changes have been successfully saved!', 'notification');
    } catch (error) {
	showPopUpMessage(error, 'error');
    }
});

loginBtn?.addEventListener('click', async () => {
    /** @type {HTMLInputElement|null} */
    const email = document.querySelector('#login_email');
    /** @type {HTMLInputElement|null} */
    const password = document.querySelector('#login_password');
    if (email && password) {
	if (email.value.trim().match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/) === null) {
	    showPopUpMessage('The email or password is incorrect', 'error');
	} else {
	    const json = localStorage.getItem('users') ?
	                 localStorage.getItem('users') : 
	                 '{"email": "", "salt": "", "hash": ""}';
	    // @ts-ignore
	    const user = JSON.parse(json);
	    const salt = new Uint8Array(JSON.parse('['+user.salt+']'));
	    // get a hash of current user's password
	    const hash = await getHash(salt, password.value);
	    if (email.value.trim() === user.email && user.hash === hash) {
		// set session_id in localStorage and cookie
		// const salt = window.crypto.getRandomValues(new Uint8Array(16));
		// const salt = window.crypto.getRandomValues(new Uint8Array(16));
		// const sessionId = await getHash(salt, password.value);
		const sessionId = '0000-000-0000-00000';
		// localStorage.setItem('session_id', sessionId);
		console.log(`cookie: ${document.cookie}`);
		document.cookie = `sessionId=${sessionId}; max-age=300`; // 5min
		console.log(`cookie: ${document.cookie}`);
		// @ts-ignore
		window.location = `index.html`;
	    } else {
		showPopUpMessage("Email and Password don't match", 'error');
	    }
	}
    }
});

logoutBtn?.addEventListener('click', () => {
    // @ts-ignore
    document.cookie = `sessionId=; expires=${new Date(0)}`;
    window.location = 'login.html'; //CHECK THIS !!! may be location.href = '/login.html';??
});

signupBtn?.addEventListener('click', async () => {
    /** @type {HTMLInputElement|null} */
    const email = document.querySelector('#signup_email');
    /** @type {HTMLInputElement|null} */
    const password = document.querySelector('#signup_password');
    /** @type {HTMLInputElement|null} */
    const repeat_password = document.querySelector('#signup_repeat_password');
    if (email && password && repeat_password) {
	if (email.value.trim().match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/) === null) {
	    showPopUpMessage('Invalid email address', 'error');
	} else if (!password.value.trim()) {
	    showPopUpMessage('Empty password', 'error');
	} else if (password.value !== repeat_password.value) {
	    showPopUpMessage("Passwords don't match", 'error');
	} else {
	    const salt = window.crypto.getRandomValues(new Uint8Array(16));
	    const hash = await getHash(salt, password.value);
	    const saltStr = salt.toString();
	    const userData = JSON.stringify({'email': email.value.trim(), 'salt': saltStr, 'hash': hash});
	    // create user
	    // create session
	    const saltSession = window.crypto.getRandomValues(new Uint8Array(16));
	    const random = '';
	    const hashSession = await getHash(saltSession, random);
	    localStorage.setItem('users', userData);
	    // @ts-ignore
	    window.location = 'index.html';
	}
    }
});

addNewLinkBtn?.addEventListener('click', () => {
    addNewLinkAndMockupBadge({'source': 'GitHub', 'url': ''});
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
	mockupAvatar.src = 'images/icon-upload-image.svg';
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
    try {
	const json = localStorage.getItem('info') ?
	             localStorage.getItem('info') :
	             '{"avatar": "", "name": "", "email": "", "links": []}';
	// @ts-ignore
	const savedData = JSON.parse(json);
	const data      = scrapeData();
	// comparison works only if the order of the keys is the same
	if (JSON.stringify(data) !== JSON.stringify(savedData)) {
	    e.preventDefault();
	    e.stopPropagation();
	    const dialog = document.querySelector('dialog');
	    if (dialog) dialog.showModal();
	}
    } catch (error) {
	showPopUpMessage(error, 'error');
	e.preventDefault();
	e.stopPropagation()
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

popUpMessage?.addEventListener('animationend', () => {
    popUpMessage.removeAttribute('animated');
}, false);

// ************************* 2. Functions *******************************//

/**
 * Creates a new hash from password with a little bit salt
 * @param {Uint8Array} salt
 * @param {string} password
 */
async function getHash(salt, password) {
    // https://stackoverflow.com/questions/67993979/using-javascript-web-crypto-api-to-generate-c-sharp-compatible-pbkdf2-key
    // https://gist.github.com/siscia/5ed3277551370df3eb8b1063923621d4
    const subtle = window.crypto.subtle;
    const deriveBitsOptions = {name: "PBKDF2", hash: 'SHA-512', salt: salt, iterations: 10000};
    const uintPass = new TextEncoder().encode(password);
    // creating a key with a slow cryptographic secure function (PBKDF2)
    const ik = await subtle.importKey('raw', uintPass, {name: 'PBKDF2'}, false, ['deriveBits']);
    // creating array of bits from a key (ik) 
    const dk = await subtle.deriveBits(deriveBitsOptions, ik, 512);
    const array = Array.from(new Uint8Array(dk));
    const hash = array.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hash;
}

/**
 * Scrape data from index.html page
 */
function scrapeData() {
    /** @type {HTMLButtonElement|null} */
    const uploadImgBtn = document.querySelector('.upload-image-btn');
    /** @type {HTMLInputElement|null} */
    const firstName    = document.querySelector('#first_name');
    /** @type {HTMLInputElement|null} */
    const lastName     = document.querySelector('#last_name');
    /** @type {HTMLInputElement|null} */
    const email        = document.querySelector('#email');
    const userLinks    = document.querySelector('.user-links');

    if (uploadImgBtn && firstName && lastName && email && userLinks) {
	let avatar = '';
	let name   = '';
	let eMail  = '';
	let links  = [];

	if (email.value.trim() &&
	    email.value.match(/^[\w\-\.]+@[\w\-\.]+\.[a-z]{2,3}$/) === null) {
	    throw Error('Invalid email address');
	} else if (firstName.value.trim() === '') {
	    throw Error('First name is required');
	} else if (lastName.value.trim() === '') {
	    throw Error('Last name is required');
	} else if (userLinks.children.length === 0) {
	    throw Error('Links is required');
	} else {
	    const bgImage = uploadImgBtn.style.backgroundImage;
	    if (bgImage) {		
		const matchArr = bgImage.match(/url\(["']?([^"']*)["']?\)/);
		if (matchArr) avatar = matchArr[1];
	    }
	    name = firstName.value.trim() + ' ' +  lastName.value.trim();
	    eMail = email.value.trim();
	    const listOfLinks = document.querySelectorAll('.user-links > li');
	    listOfLinks.forEach((item) => {
		const source = item.querySelector('.select > button span');
		const url    = item.querySelector('input');
		if (source && url) {
		    if (!url.value.trim()) throw Error('Link without URL');
		    const link = {'source': source.textContent?.trim(), 'url': url.value.trim()};
		    links.push(link);
		}
	    });
	    return {
		'avatar': avatar,
		'name':   name,
		'email':  eMail,
		'links':  links,
	    };
	}
    } else {
	throw Error("Can't find some element");
    }
}

/**
 * @param {object} linkInfo
 */
function addNewLinkAndMockupBadge(linkInfo) {
    const parentDiv = document.querySelector('.user-links');
    const template  = document.querySelector('#template_new_link');
    if (parentDiv && template) {
	// @ts-ignore
	const clone = template.content.firstElementChild?.cloneNode(true);
	if (clone) {
	    const total = parentDiv.querySelectorAll(':scope>li');

	    const title             = clone.querySelector('h5');
	    const removeBtn         = clone.querySelector('.row>button');
	    const selectBtn         = clone.querySelector('.select>button');
	    const selectOptions     = clone.querySelector('.select>.options');
	    const labelForInput     = clone.querySelector('.column>label');
	    const input             = clone.querySelector('input');

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

		const selectOptionsLi   = clone.querySelectorAll('.select>.options>li');
		selectOptionsLi.forEach((item) => {
		    // set current selected item
		    const sourceName = item.querySelector('span');
		    if (sourceName && sourceName.textContent === linkInfo.source) {
			setSelectedItem(selectOptions, item);
		    }
		    item.addEventListener('mousedown', (e) => {
			if (e.currentTarget) setSelectedItem(selectOptions, e.currentTarget);
		    });
		});

		removeBtn.addEventListener('click', () => {
		    // remove correct badge
		    const linkIndex = [...parentDiv.children].indexOf(clone);
		    const phoneMockup = document.querySelector('.phone-mockup');
		    if (phoneMockup) {
			phoneMockup.removeChild(phoneMockup.children[linkIndex + 4]);
		    }
		    // remove link from User Links
		    parentDiv.removeChild(clone);
		    // rewrite value of some attributes of the remaining links
		    let index = 1;
		    [...parentDiv.children].forEach((child) => {
			const editableElements = child.querySelectorAll('h5, label, button[id], ul, input');
			editableElements.forEach((item) => {
			    if (item.tagName === 'H5') {
				item.textContent = `Link #${index}`;
			    }
			    if (item.tagName === 'LABEL') {
				item.setAttribute('for', `input_${index}`);
			    }
			    if (item.tagName === 'BUTTON') {
				item.setAttribute('id', `select_${index}`);
				item.setAttribute('aria-controls', `options_${index}`);
			    }
			    if (item.tagName === 'UL') {
				item.setAttribute('id', `options_${index}`);
			    }
			    if (item.tagName === 'INPUT') {
				item.setAttribute('id', `input_${index}`);
			    }
			});
			index++;
		    });
		    // we allow to add new links
		    if (addNewLinkBtn?.hasAttribute('disabled')) addNewLinkBtn?.removeAttribute('disabled');
		});

		// we forbit adding new links
		if (index > 4) addNewLinkBtn?.setAttribute('disabled', '');

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
			let path    = getLinkAttributeBySourceName(currentTargetSpan.textContent).path;
			let bgColor = getLinkAttributeBySourceName(currentTargetSpan.textContent).bgcolor;
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
		console.log(`Finish observe to ${optionsElement.id} and ${selectBtn.id}`);
	    } else {
		optionsElement.removeAttribute('data-visible');
		selectBtn.setAttribute('aria-expanded', 'true');
		// set autoscroll to current item in options list
		const currentItem = optionsElement.querySelector('li[data-status="selected"]');
		if (currentItem) {
		    const index = [...optionsElement.children].indexOf(currentItem);
		    optionsElement.scrollTo({
			top: 40 * (index - 2),
			behavior: 'smooth',
		    });
		}

		observerOptions.observe(optionsElement);
		observerSelect.observe(selectBtn);
		console.log(`Start observe to ${optionsElement.id} and ${selectBtn.id}`);
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

/**
 * Generates a html text of links.
 * @param {Array} links
 */
function createListOfPreviewLinks(links) {
    let list = '';
    links.forEach((item) => {
	let path    = getLinkAttributeBySourceName(item.source).path;
	let bgColor = getLinkAttributeBySourceName(item.source).bgcolor;
	const li = `<li>
                      <a
                        style="--image_path: url(${path});"
                        target="_blank"
                        class=${bgColor}
                        href=${item.url}>
                          ${item.source}
                      </a>
                    </li>`;
	list = list + li;
    });
    return list;
}

/**
 * Returns bg-color and path of icon according to the `source` name.
 * @param {string} source
 */
function getLinkAttributeBySourceName(source) {
    let attr = {'path': '',
		'bgcolor': 'bg-p-purple'};

    if (source === 'GitHub') {
	attr.path  = 'images/icon-github.svg';
	attr.bgcolor = 'bg-github';
    }
    if (source === 'LinkedIn') {
	attr.path  = 'images/icon-linkedin.svg';
	attr.bgcolor = 'bg-linkedin';
    }
    if (source === 'GitLab') {
	attr.path  = 'images/icon-gitlab.svg';
	attr.bgcolor = 'bg-gitlab';
    }
    if (source === 'StackOverflow') {
	attr.path  = 'images/icon-stack-overflow.svg';
	attr.bgcolor = 'bg-stackoverflow';
    }
    if (source === 'YouTube') {
	attr.path  = 'images/icon-youtube.svg';
	attr.bgcolor = 'bg-youtube';
    }
    if (source === 'Facebook') {
	attr.path  = 'images/icon-facebook.svg';
	attr.bgcolor = 'bg-facebook';
    }
    if (source === 'Twitch') {
	attr.path  = 'images/icon-twitch.svg';
	attr.bgcolor = 'bg-twitch';
    }
    if (source === 'Twitter') {
	attr.path  = 'images/icon-twitter.svg';
	attr.bgcolor = 'bg-twitter';
    }
    if (source === 'Hashnode') {
	attr.path  = 'images/icon-hashnode.svg';
	attr.bgcolor = 'bg-hashnode';
    }
    if (source === 'Codepen') {
	attr.path  = 'images/icon-codepen.svg';
	attr.bgcolor = 'bg-codepen';
    }
    if (source === 'Devto') {
	attr.path  = 'images/icon-devto-gray.svg';
	attr.bgcolor = 'bg-devto';
    }
    if (source === 'Codewars') {
	attr.path  = 'images/icon-codewars.svg';
	attr.bgcolor = 'bg-codewars';
    }
    if (source === 'Freecodecamp') {
	attr.path  = 'images/icon-freecodecamp.svg';
	attr.bgcolor = 'bg-freecodecamp';
    }
    if (source === 'Frontend mentor') {
	attr.path  = 'images/icon-frontend-mentor-gray.svg';
	attr.bgcolor = 'bg-frontendmentor';
    }

    return attr;
}

/**
 * @param {string} msg
 * @param {string} type
 */
function showPopUpMessage(msg, type) {
    const popUpMessage = document.querySelector('.pop-up-message');
    if (popUpMessage) {
	const text = popUpMessage.querySelector('p');
	if (text) {
	    text.textContent = msg;
	    if (type === 'error') {
		popUpMessage.classList.add('bg-p-red');
		popUpMessage.classList.remove('bg-n-800');
	    }
	    if (type === 'notification') {
		popUpMessage.classList.add('bg-n-800');
		popUpMessage.classList.remove('bg-p-red');
	    }
	    popUpMessage.setAttribute('animated', '');
	}
    }
}

const parametrs = {
    root: document.querySelector('.user-links'),
    rootMargin: '0px',
    threshold: 1.0,
};

const callbackOptions = (entries) => {
    entries.forEach((entry) => {
	console.log(`${entry.target.id} intersection is ${entry.isIntersecting}`);
	if (entry.isIntersecting === false) {
	    if (entry.target.getAttribute('data-position') === 'above') {
		entry.target.setAttribute('data-position', 'under');
	    } else if (entry.target.getAttribute('data-position') === 'under') {
		entry.target.setAttribute('data-position', 'above');
	    }
	}
    });
};

const callbackSelect = (entries) => {
    entries.forEach((entry) => {
	console.log(`${entry.target.id} intersection is ${entry.isIntersecting}`);
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

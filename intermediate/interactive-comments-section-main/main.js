// @ts-check

import {
    observerAuthState,
    timestampToString,
    convertToObj,
    signInAnonymously,
    signIn,
    signOut,
    getComments,
    getComment,
    createCommentRef,
    createComment,
    updateComment,
    deleteComment,
    deleteUser,
} from "./repository.js";

/**
* @type {HTMLDivElement|null}
*/
const commentBoardHTML = document.querySelector('#comment_board');

/**
* @type {HTMLTemplateElement|null}
*/
const commentTemplateHTML = document.querySelector('#comment_template');

/**
* @type {HTMLFormElement|null}
*/
const sendFormHTML = document.querySelector('#form_send');

/**
* @type {HTMLDivElement|null}
*/
const loginBtns = document.querySelector('.login-btns');

/**
* @type {HTMLDivElement|null}
*/
const userInfo = document.querySelector('#user_info');

/**
* @type {HTMLButtonElement|null}
*/
const githubLoginBtn = document.querySelector('#github_login_btn');

/**
* @type {HTMLButtonElement|null}
*/
const anonymousLoginBtn = document.querySelector('#anonymous_login_btn');

/**
* @type {HTMLButtonElement|null}
*/
const logOutBtn = document.querySelector('#logout_btn');

/**
* @type {HTMLTextAreaElement|null}
*/
const textareaMobileSendFormHTML = document.querySelector('#send_mobile');

/**
* @type {HTMLTextAreaElement|null}
*/
const textareaDesktopSendFormHTML = document.querySelector('#send_desktop');

/**
* @type {HTMLDivElement|null}
*/
const firebaseLogo = document.querySelector('.firebase-logo img');

/**
* @type {HTMLImageElement|null}
*/
const emptyBoxImg = document.querySelector('.empty-box');

/**
* @type {HTMLDialogElement|null}
*/
const modalDialog = document.querySelector('#modal_dialog');

/**
* @type {HTMLButtonElement|null}
*/
const modalDialogCancelBtn = document.querySelector('#modal_dialog_cancel_btn');

/**
* @type {HTMLButtonElement|null}
*/
const modalDialogDeleteBtn = document.querySelector('#modal_dialog_delete_btn');

let currentUser = null;

/**
 * For deleting anonymous user from AuthenticationFirebase
 */
let currentFirebaseUser = null;

/**
 * Keep id of deleting comment
 * @type {string|null}
 */
let currentId = null;

// ************************** 1. Events *********************************//

/**
 * @param {string} text
 */
function processText(text) {
    const newText = text
        .replace('[', '<span class="fw-medium clr-p-blue">@')
        .replace(']', '</span>');

    return newText;
}

function smoothScroll(div, block) {
    div.scrollIntoView({ behavior: "smooth", block: block });
}

function getCurrentUserData(user) {
    if (user.isAnonymous) {
        return {
            id: null,
            username: 'Anonymous',
            photoUrl: null,
        }
    }
    return {
        id: user.reloadUserInfo.providerUserInfo[0].rawId,
        username: user.reloadUserInfo.providerUserInfo[0].screenName,
        photoUrl: user.reloadUserInfo.providerUserInfo[0].photoUrl,
    }
}

window.addEventListener('load', () => {
    observerAuthState(async (user) => {
        console.log(user);
        if (user) {
            console.log('log in');
            try {
                currentFirebaseUser = user;
                currentUser = getCurrentUserData(user);
                firebaseLogo?.removeAttribute('data-visible');
                const data = await getComments();
                if (data.length === 0) {
                    firebaseLogo?.setAttribute('data-visible', 'false')
                    emptyBoxImg?.removeAttribute('data-visible');
                } else {
                    data.forEach(obj => {
                        const commentHTML = createHtmlFromObject(obj);
                        if (commentHTML) {
                            firebaseLogo?.setAttribute('data-visible', 'false')
                            commentBoardHTML?.appendChild(commentHTML);
                        }
                    });
                }
                const username = userInfo?.querySelector('p');
                const userimage = userInfo?.querySelector('img');
                if (username && userimage) {
                    username.textContent = currentUser.username;
                    if (currentUser.photoUrl) {
                        userimage.src = currentUser.photoUrl;
                    }
                }
                userInfo?.removeAttribute('data-visible');
                const sendFormImg = sendFormHTML?.querySelector('.avatar')
                if (sendFormImg && currentUser.photoUrl) {
                    sendFormImg.src = currentUser.photoUrl;
                }
                sendFormHTML?.removeAttribute('data-visible');
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log('log out');
            currentUser = null;
            firebaseLogo?.setAttribute('data-visible', 'false');
            loginBtns?.removeAttribute('data-visible');
        }
    });
});

anonymousLoginBtn?.addEventListener('click', async () => {
    try {
        firebaseLogo?.removeAttribute('data-visible');
        loginBtns?.setAttribute('data-visible', 'false');
        await signInAnonymously();
    } catch (error) {
        console.log(`error: ${error}`);
    }
});

githubLoginBtn?.addEventListener('click', async () => {
    try {
        firebaseLogo?.removeAttribute('data-visible');
        loginBtns?.setAttribute('data-visible', 'false');
        await signIn();
    } catch (error) {
        console.log(`error: ${error}`);
    }
});

logOutBtn?.addEventListener('click', async () => {
    try {
        firebaseLogo?.removeAttribute('data-visible');
        userInfo?.setAttribute('data-visible', 'false');
        sendFormHTML?.setAttribute('data-visible', 'false');
        if (commentBoardHTML) {
            const array = [...commentBoardHTML.children];
            array.forEach(elem => {
                const id = elem.getAttribute('id');
                if (id !== null && id.length === 20) {
                    commentBoardHTML.removeChild(elem);
                }
            });
        }
        if (currentFirebaseUser.isAnonymous) {
            await deleteUser(currentFirebaseUser);
        }
        await signOut();
    } catch (error) {
        console.log(error);
    }
});

modalDialogCancelBtn?.addEventListener('click', () => {
    modalDialog?.close();
});

modalDialogDeleteBtn?.addEventListener('click', async () => {
    modalDialog?.close();
    try {
        if (currentId) {
            const comment = document.getElementById(currentId);
            if (comment) {
                comment.setAttribute('data-status', 'in progress');
                const doc = await getComment(currentId);
                if (doc.replyingTo === null) {
                    if (doc.replies.length > 0) {
                        deleteRecursive(doc.replies);
                    }
                    await deleteComment(doc.id)
                    commentBoardHTML?.removeChild(comment);
                }
                if (doc.replyingTo != null) {
                    if (doc.replies.length > 0) {
                        deleteRecursive(doc.replies);
                    }
                    await deleteComment(doc.id)

                    //update list of replies in replying to Doc
                    const replyingToDoc = await getComment(doc.replyingTo);
                    let array = replyingToDoc.replies;
                    const index = array.findIndex((element) => {
                        return element.id === doc.id;
                    });
                    array.splice(index, 1);
                    await updateComment(doc.replyingTo, { 'replies': array });

                    const replies = comment.closest('.replies');
                    if (replies) {
                        if (replies.children.length === 1) {
                            const topComment = replies.closest('div[id].column');
                            if (topComment) {
                                topComment.removeChild(replies);
                            }
                        }
                        if (replies.children.length > 1) {
                            replies.removeChild(comment);
                        }
                    }
                }
            }
        }
        currentId = null;
    } catch (error) {
        console.log(error);
    }
});

textareaMobileSendFormHTML?.addEventListener('input', () => {
    if (sendFormHTML) {
        /**
         * SEND button
         * @type {HTMLButtonElement|null}
         */
        const btn = sendFormHTML.querySelector('.cta');
        if (btn) {
            textareaMobileSendFormHTML.value.trim() != '' ?
                btn.disabled = false :
                btn.disabled = true;
        }
    }
});

// set custom border style for textarea in send form (mobile)
textareaMobileSendFormHTML?.addEventListener('focusin', () => {
    const listWrappers = sendFormHTML?.querySelectorAll('.wrapper');
    listWrappers?.forEach(elem => {
        elem.setAttribute('data-status', 'focus');
    });
});

// remove custom border style for textarea in send form (mobile)
textareaMobileSendFormHTML?.addEventListener('focusout', () => {
    const listWrappers = sendFormHTML?.querySelectorAll('.wrapper');
    listWrappers?.forEach(elem => {
        elem.removeAttribute('data-status');
    });
});

textareaDesktopSendFormHTML?.addEventListener('input', () => {
    if (sendFormHTML) {
        /**
         * SEND button
         * @type {HTMLButtonElement|null}
         */
        const btn = sendFormHTML.querySelector('.cta');
        if (btn) {
            textareaDesktopSendFormHTML.value.trim() != '' ?
                btn.disabled = false :
                btn.disabled = true;
        }
    }
});

// set custom border style for textarea in send form (desktop)
textareaDesktopSendFormHTML?.addEventListener('focusin', () => {
    const listWrappers = sendFormHTML?.querySelectorAll('.wrapper');
    listWrappers?.forEach(elem => {
        elem.setAttribute('data-status', 'focus');
    });
});

// remove custom border style for textarea in send form (desktop)
textareaDesktopSendFormHTML?.addEventListener('focusout', () => {
    const listWrappers = sendFormHTML?.querySelectorAll('.wrapper');
    listWrappers?.forEach(elem => {
        elem.removeAttribute('data-status');
    });
});

sendFormHTML?.addEventListener('submit', async (e) => {
    e.preventDefault();

    /**
    * @type {HTMLTextAreaElement|null}
    */
    let content = document.querySelector('#send_mobile');
    if (window.matchMedia && window.matchMedia("(min-width: 36em)").matches) {
        content = document.querySelector('#send_desktop');
    }

    if (content) {
        const obj = convertToObj(
            content.value,
            null,
            null,
            null,
            null,
            currentUser,
        );
        const commentHTML = createHtmlFromObject(obj);
        if (commentHTML) {
            emptyBoxImg?.setAttribute('data-visible', 'false');
            commentHTML.setAttribute('data-status', 'in progress');
            commentBoardHTML?.appendChild(commentHTML);
            smoothScroll(commentHTML, "end");
            try {
                const id = await createComment(obj);
                commentHTML.removeAttribute('data-status');
                commentHTML.setAttribute('id', id);
                if (textareaDesktopSendFormHTML && textareaMobileSendFormHTML) {
                    textareaDesktopSendFormHTML.value = '';
                    textareaMobileSendFormHTML.value = '';
                }
                /**
                 * SEND btn
                 * @type {HTMLButtonElement|null}
                 */
                const btn = sendFormHTML.querySelector('.cta');
                if (btn) {
                    btn.disabled = true;
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
});

// ************************* 2. Functions *******************************//

/**
 * @param {string} id id-key of current comment
 * @param {string} operator '+' or '-'
 * @returns {Promise<void>}
 */
async function changeScore(id, operator) {
    const div = document.getElementById(id);
    if (div) {
        const commentHTML = div.querySelector('article');
        if (commentHTML) {
            try {
                /**
                 * @type {NodeListOf<HTMLOutputElement>}
                 */
                const listScore = commentHTML.querySelectorAll('.score');
                let value = operator === '+' ?
                    Number(listScore[0].value) + 1 :
                    Number(listScore[0].value) - 1
                if (value > 99) { value = 99; }
                if (value < -99) { value = -99; }
                listScore.forEach(score => {
                    score.value = value.toString();
                });
                await updateComment(id, { 'score': value });
            } catch (error) {
                console.log(error);
            }
        }
    }
}

function createHtmlFromObject(obj) {
    const newCommentHtml = createHtmlTemplate(obj);
    if (obj.replies.length > 0) {
        const newRepliesHtml = document.createElement('div');
        newRepliesHtml.classList.add('replies', 'column', 'gap-m');
        obj.replies.forEach(async (replyRef) => {
            const docObj = await getComment(replyRef);
            const newHtml = createHtmlFromObject(docObj);
            if (newHtml) {
                newRepliesHtml.appendChild(newHtml);
            }
        });
        newCommentHtml?.appendChild(newRepliesHtml);
    }

    return newCommentHtml;
}

function deleteRecursive(array) {
    array.forEach(async (docRef) => {
        const doc = await getComment(docRef);
        deleteRecursive(doc.replies);
        await deleteComment(docRef);
    });
}

function createHtmlTemplate(obj) {
    if (commentTemplateHTML) {
        const firstChild = commentTemplateHTML.content.firstElementChild;
        if (firstChild) {
            const clone = firstChild.cloneNode(true);
            clone.setAttribute('id', obj.id);

            // comment's elements
            const h3 = clone.querySelector('h3');
            const content = clone.querySelector('.content');
            const createdAt = clone.querySelector('.createdAt');
            const listScore = clone.querySelectorAll('.score');
            const username = clone.querySelector('.username');
            const component = clone.querySelector('.component');
            const userPhoto = clone.querySelector('#user_photo');

            h3.textContent = `${obj.user.username}'s comment`;
            content.innerHTML = processText(obj.content);
            createdAt.textContent = timestampToString(obj.createdAt);
            listScore.forEach(score => {
                score.textContent = obj.score;
            });
            if (obj.user.photoUrl) {
                userPhoto.src = obj.user.photoUrl;
            }
            username.textContent = obj.user.username;
            if (currentUser.id && currentUser.id === obj.user.id) {
                component.setAttribute('data-status', 'editable');
            }

            // forms
            const formUpdate = clone.querySelector('.grid form');
            const labelFormUpdate = formUpdate.querySelector('label');
            const wrapperTextareaFormUpdate = formUpdate.querySelector('.wrapper');
            const textareaFormUpdate = formUpdate.querySelector('textarea');
            labelFormUpdate.setAttribute('for', labelFormUpdate.getAttribute('for') + obj.id);
            textareaFormUpdate.setAttribute('id', textareaFormUpdate.getAttribute('id') + obj.id);
            textareaFormUpdate.textContent = obj.content;

            const formReply = clone.querySelector('form:nth-child(2)');
            const formReplyAvatar = formReply.querySelector('.avatar');
            if (currentUser.photoUrl) {
                formReplyAvatar.src = currentUser.photoUrl;
            }
            const labelFormReplyMobile = formReply.querySelector('.sm\\:display-none>label');
            const textareaFormReplyMobile = formReply.querySelector('.sm\\:display-none>textarea');
            const labelFormReplyDesktop = formReply.querySelector('.m\\:display-none>label');
            const textareaFormReplyDesktop = formReply.querySelector('.m\\:display-none>textarea');
            const wrapperTextareaFormReply = formReply.querySelectorAll('.wrapper');
            labelFormReplyMobile.setAttribute('for', labelFormReplyMobile.getAttribute('for') + obj.id);
            textareaFormReplyMobile.setAttribute('id', textareaFormReplyMobile.getAttribute('id') + obj.id);
            labelFormReplyDesktop.setAttribute('for', labelFormReplyDesktop.getAttribute('for') + obj.id);
            textareaFormReplyDesktop.setAttribute('id', textareaFormReplyDesktop.getAttribute('id') + obj.id);

            // buttons
            const listBtnScorePlus = clone.querySelectorAll('.score-plus');
            const listBtnScoreMinus = clone.querySelectorAll('.score-minus');
            const listBtnSwitcherEdit = clone.querySelectorAll('.switcher_edit');
            const listBtnDelete = clone.querySelectorAll('.delete');
            const listBtnSwitcherReply = clone.querySelectorAll('.switcher_reply');

            // events
            textareaFormReplyMobile.addEventListener('input', () => {
                // reply btn
                const btn = clone.querySelector('.column.gap-sm>form .cta');
                textareaFormReplyMobile.value.trim() != '' ?
                    btn.disabled = false :
                    btn.disabled = true;
            });

            // set custom border style for textarea (mobile)
            textareaFormReplyMobile.addEventListener('focusin', () => {
                wrapperTextareaFormReply.forEach(elem => {
                    elem.setAttribute('data-status', 'focus');
                });
            });

            // remove custom border style for textarea (mobile)
            textareaFormReplyMobile.addEventListener('focusout', () => {
                wrapperTextareaFormReply.forEach(elem => {
                    elem.removeAttribute('data-status');
                });
            });

            textareaFormReplyDesktop.addEventListener('input', () => {
                // reply btn
                const btn = clone.querySelector('.column.gap-sm>form .cta');
                textareaFormReplyDesktop.value.trim() != '' ?
                    btn.disabled = false :
                    btn.disabled = true;
            });

            // set custom border style for textarea (desktop)
            textareaFormReplyDesktop.addEventListener('focusin', () => {
                wrapperTextareaFormReply.forEach(elem => {
                    elem.setAttribute('data-status', 'focus');
                });
            });

            // remove custom border style for textarea (desktop)
            textareaFormReplyDesktop.addEventListener('focusout', () => {
                wrapperTextareaFormReply.forEach(elem => {
                    elem.removeAttribute('data-status');
                });
            });

            textareaFormUpdate.addEventListener('input', () => {
                // update btn
                const btn = clone.querySelector('.column.gap-sm>article .cta');
                (textareaFormUpdate.value.trim() != '') ?
                    btn.disabled = false :
                    btn.disabled = true;
            });

            //set custom border style of textarea when focus
            textareaFormUpdate?.addEventListener('focusin', () => {
                wrapperTextareaFormUpdate.setAttribute('data-status', 'focus');
            });

            //remove custom border style of textarea when focus
            textareaFormUpdate?.addEventListener('focusout', () => {
                wrapperTextareaFormUpdate.removeAttribute('data-status');
            });

            listBtnScorePlus.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = clone.getAttribute('id');
                    await changeScore(id, '+');
                });
            });

            listBtnScoreMinus.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = clone.getAttribute('id');
                    await changeScore(id, '-');
                });
            });

            listBtnSwitcherEdit.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (formUpdate?.hasAttribute('data-visible') === true) {
                        content.setAttribute('data-visible', 'false');
                        formUpdate.removeAttribute('data-visible');
                        textareaFormUpdate.value = content.textContent;
                        smoothScroll(clone, "end");
                    } else {
                        content.removeAttribute('data-visible');
                        formUpdate.setAttribute('data-visible', 'false');
                    }
                });
            });

            listBtnSwitcherReply.forEach(btn => {
                if (currentUser.id === null) {
                    btn.setAttribute('data-visible', 'false');
                }
                btn?.addEventListener('click', () => {
                    if (formReply?.hasAttribute('data-visible') === true) {
                        const listFormReply = document.querySelectorAll('form:nth-child(2)');
                        // close all open form reply
                        listFormReply.forEach(form => {
                            form.setAttribute('data-visible', 'false');
                        });
                        // open this one
                        formReply.removeAttribute('data-visible');
                        smoothScroll(formReply, "end");
                    } else {
                        formReply.setAttribute('data-visible', 'false');
                        textareaFormReplyMobile.value = '';
                        textareaFormReplyDesktop.value = '';
                    }
                });
            });

            listBtnDelete.forEach(btn => {
                btn?.addEventListener('click', async () => {
                    modalDialog?.showModal();
                    currentId = clone.getAttribute('id');
                });
            });

            formUpdate.addEventListener('submit', async (e) => {
                e.preventDefault();
                content.removeAttribute('data-visible');
                formUpdate.setAttribute('data-visible', 'false');
                try {
                    const id = clone.getAttribute('id');
                    content.textContent = textareaFormUpdate.value;
                    await updateComment(id, { 'content': textareaFormUpdate.value });
                } catch (error) {
                    console.log(error);
                }
            });

            formReply.addEventListener('submit', async (e) => {
                e.preventDefault();
                let content = textareaFormReplyMobile;
                if (window.matchMedia && window.matchMedia("(min-width: 36em)").matches) {
                    content = textareaFormReplyDesktop;
                }
                const id = clone.getAttribute('id');
                try {
                    const newObj = convertToObj(
                        `[${username.textContent}], ` + content.value,
                        null,
                        null,
                        createCommentRef(id),
                        null,
                        currentUser,
                    );
                    const newCommentHTML = createHtmlFromObject(newObj);
                    formReply.setAttribute('data-visible', 'false');
                    if (newCommentHTML) {
                        newCommentHTML.setAttribute('data-status', 'in progress');

                        const replies = clone.querySelector('.replies');
                        if (replies) {
                            replies.appendChild(newCommentHTML);
                        } else {
                            const div = document.createElement('div');
                            div.classList.add('replies', 'column', 'gap-m');
                            div.appendChild(newCommentHTML);
                            clone.appendChild(div);
                        }
                        smoothScroll(newCommentHTML, 'end');

                        const newId = await createComment(newObj);
                        const doc = await getComment(id);
                        doc.replies.push(createCommentRef(newId));
                        await updateComment(doc.id, { 'replies': doc.replies });

                        newCommentHTML.removeAttribute('data-status');
                        newCommentHTML.setAttribute('id', newId);
                        content.value = '';
                    }
                } catch (error) {
                    console.log(error);
                }
            });

            return clone;
        }
    }
}
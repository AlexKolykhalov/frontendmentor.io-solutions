// @ts-check

import {
    timestampToString,
    convertToObj,
    getCurrentUser,
    signIn,
    getComments,
    getComment,
    createCommentRef,
    createComment,
    updateComment,
    deleteComment,
    signOut
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
* @type {HTMLButtonElement|null}
*/
const loginBtn = document.querySelector('#login_btn');

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
const firebaseLogo = document.querySelector('.firebase-logo');

let currentUser = null;

// **********************************************************************//
// ***********************  Table of content  ***************************//
// **********************************************************************//
// 
// 1. Events
//  1.1 Form
//  
// 2. Functions


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

window.addEventListener('load', async () => {
    try {
        firebaseLogo?.removeAttribute('data-visible');
        const data = await getComments();
        currentUser = getCurrentUser();
        if (sendFormHTML && currentUser) {
            sendFormHTML.removeAttribute('data-visible');
            const p = loginBtn?.querySelector('p');
            if (p) {
                p.textContent = 'Log out';
            }
            /**
             * @type {HTMLImageElement|null}
             */
            const avatar = sendFormHTML?.querySelector('.avatar');
            if (avatar) {
                avatar.src = currentUser.photoURL;
            }
        }
        data.forEach(obj => {
            const commentHTML = createHtmlFromObject(obj);
            if (commentHTML) {
                firebaseLogo?.setAttribute('data-visible', 'false')
                commentBoardHTML?.appendChild(commentHTML);
            }
        });
        if (loginBtn) {
            loginBtn.disabled = false;
        }
    } catch (error) {
        console.log(error);
    }
});

loginBtn?.addEventListener('click', async () => {
    try {
        const p = loginBtn.querySelector('p');
        if (p && p.textContent === 'Log out') {
            await signOut();
            p.textContent = 'Log in';
            if (sendFormHTML) {
                sendFormHTML?.setAttribute('data-visible', 'false');
                /**
                 * @type {HTMLImageElement|null}
                 */
                const avatar = sendFormHTML?.querySelector('.avatar');
                if (avatar) {
                    avatar.src = '';
                }
            }
            const listEditable = document.querySelectorAll('[data-status="editable"]');
            listEditable.forEach(el => {
                el.removeAttribute('data-status');
            });
            const listBtnSwitcherEdit = document.querySelectorAll('.switcher_reply');
            listBtnSwitcherEdit.forEach(el => {
                el.setAttribute('data-visible', 'false');
            });
        } else {
            const loader = loginBtn.querySelector('.lds-ring');
            const svg = loginBtn.querySelector('svg');
            svg?.setAttribute('data-visible', 'false');
            loader?.removeAttribute('data-visible');
            currentUser = await signIn();
        }
    } catch (error) {
        console.log(`error: ${error}`);
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
            const sendFormAvatar = clone.querySelector('#user_photo');

            h3.textContent = `${obj.user.username}'s comment`;
            content.innerHTML = processText(obj.content);
            createdAt.textContent = timestampToString(obj.createdAt);
            listScore.forEach(score => {
                score.textContent = obj.score;
            });
            sendFormAvatar.src = obj.user.photoURL;
            username.textContent = obj.user.username;
            if (currentUser && currentUser.id === obj.user.id) {
                component.setAttribute('data-status', 'editable');
            }

            // forms
            const formUpdate = clone.querySelector('.grid form');
            const labelFormUpdate = formUpdate.querySelector('label');
            const textareaFormUpdate = formUpdate.querySelector('textarea');
            labelFormUpdate.setAttribute('for', labelFormUpdate.getAttribute('for') + obj.id);
            textareaFormUpdate.setAttribute('id', textareaFormUpdate.getAttribute('id') + obj.id);
            textareaFormUpdate.textContent = obj.content;

            const formReply = clone.querySelector('form:nth-child(2)');
            const formReplyAvatar = formReply.querySelector('.avatar');
            if (currentUser) {
                formReplyAvatar.src = currentUser.photoURL;
            }
            const labelFormReplyMobile = formReply.querySelector('.sm\\:display-none>label');
            const textareaFormReplyMobile = formReply.querySelector('.sm\\:display-none>textarea');
            const labelFormReplyDesktop = formReply.querySelector('.m\\:display-none>label');
            const textareaFormReplyDesktop = formReply.querySelector('.m\\:display-none>textarea');
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

            textareaFormReplyDesktop.addEventListener('input', () => {
                // reply btn
                const btn = clone.querySelector('.column.gap-sm>form .cta');
                textareaFormReplyDesktop.value.trim() != '' ?
                    btn.disabled = false :
                    btn.disabled = true;
            });

            textareaFormUpdate.addEventListener('input', () => {
                // update btn
                const btn = clone.querySelector('.column.gap-sm>article .cta');
                (textareaFormUpdate.value.trim() != '') ?
                    btn.disabled = false :
                    btn.disabled = true;
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
                if (currentUser === null) {
                    btn.setAttribute('data-visible', 'false');
                }
                btn?.addEventListener('click', () => {
                    if (formReply?.hasAttribute('data-visible') === true) {
                        const listFormReply = document.querySelectorAll('form:nth-child(2)');
                        listFormReply.forEach(form => {
                            form.setAttribute('data-visible', 'false');
                        });
                        formReply.removeAttribute('data-visible');
                        smoothScroll(formReply, "end");
                    } else {
                        formReply.setAttribute('data-visible', 'false');
                    }
                });
            });

            listBtnDelete.forEach(btn => {
                btn?.addEventListener('click', async () => {
                    try {
                        const id = clone.getAttribute('id');
                        clone.setAttribute('data-status', 'in progress');
                        const doc = await getComment(id);
                        if (doc.replyingTo === null) {
                            if (doc.replies.length > 0) {
                                deleteRecursive(doc.replies);
                            }
                            await deleteComment(doc.id)
                            commentBoardHTML?.removeChild(clone);
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

                            const replies = clone.closest('.replies');
                            if (replies) {
                                if (replies.children.length === 1) {
                                    const comment = replies.closest('div[id].column');
                                    if (comment) {
                                        comment.removeChild(replies);
                                    }
                                }
                                if (replies.children.length > 1) {
                                    replies.removeChild(clone);
                                }
                            }
                        }
                    } catch (error) {
                        console.log(error);
                    }
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
// @ts-check

import { timeAgo, convert, executeQuery, read, createRef, create, update, remove } from "./firebase/firestore_api.js"
import { getAuthUser, signInGitHub, signOutFirebase } from "./firebase/auth_api.js"

/**
 * Convert timestamp format to string:
 * 
 * Timestamp {seconds: ****** , nanoseconds: ***** } -> '2 days ago' 
 * @param {unknown} timestamp  
 * @returns {string}
 */
function timestampToString(timestamp) {
    return timeAgo(timestamp);
}

/**
 * @param {string|null} content  
 * @param {unknown|null} createdAt Timestamp 
 * @param {Array|null} replies  
 * @param {unknown|null} replyingTo DocRef
 * @param {number|null} score  
 * @param {object|null} user  
 * @returns {object}
 */
function convertToObj(
    content,
    createdAt,
    replies,
    replyingTo,
    score,
    user,
) {
    return convert(
        {
            content: content,
            createdAt: createdAt,
            replies: replies,
            replyingTo: replyingTo,
            score: score,
            user: user,
            // user: {
            //     id: id,
            //     photoURL: photoURL,
            //     username: username,
            // },
        }
    );
}

/**
 * @returns {Promise<Array>} list of comments or [] 
 */
async function getComments() {
    return executeQuery('replyingTo', '==', null)
}

/**
 * @param {string|unknown} id string or DocumentReference
 * @returns {Promise<object>} data of comment including id or {}
 */
async function getComment(id) {
    return read(id);
}

/**
 * @param {string} id 
 * @returns {unknown} docRef 
 */
function createCommentRef(id) {
    return createRef(id);
}

/**
 * @param {object} createdData 
 * @returns {Promise<string>} id-key 
 */
async function createComment(createdData) {
    return create(createdData);
}

/**
 * @param {string|unknown} id 
 * @param {object} updatedData 
 * @returns {Promise<void>}
 */
async function updateComment(id, updatedData) {
    await update(id, updatedData);
}

/**
 * @param {string|unknown} id string or DocumentReference
 * @returns {Promise<void>}
 */
async function deleteComment(id) {
    await remove(id);
}

async function signIn() {
    const result = await signInGitHub();
    if (result.user.reloadUserInfo.providerUserInfo.length > 0) {
        return {
            id: result.user.reloadUserInfo.providerUserInfo[0].rawId,
            username: result.user.reloadUserInfo.providerUserInfo[0].screenName,
            photoURL: result.user.reloadUserInfo.providerUserInfo[0].photoUrl,
        };
    }
    return null;
}

async function signOut() {
    return await signOutFirebase();
}

function getCurrentUser() {
    const user = getAuthUser();
    if (user === null || user.reloadUserInfo.providerUserInfo.length === 0) {
        return null;
    }
    return {
        id: user.reloadUserInfo.providerUserInfo[0].rawId,
        username: user.reloadUserInfo.providerUserInfo[0].screenName,
        photoURL: user.reloadUserInfo.providerUserInfo[0].photoUrl,
    };
}

export {
    signIn,
    signOut,
    getCurrentUser,
    timestampToString,
    convertToObj,
    getComments,
    getComment,
    createComment,
    createCommentRef,
    updateComment,
    deleteComment
}
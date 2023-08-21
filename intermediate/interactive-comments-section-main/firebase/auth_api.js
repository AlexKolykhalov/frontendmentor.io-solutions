// @ts-check

import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInWithCredential,
    signOut,
    GithubAuthProvider
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { auth } from "./init.js"

/**
 *Return current user  
 * @returns {object|null}
 */
function getAuthUser() {
    return auth.currentUser;
}

const provider = new GithubAuthProvider();
/**
 * @returns {Promise<void>}
 */
async function signInGitHub() {
    await signInWithRedirect(auth, provider);
}

/**
 * @returns {Promise<void>}
 */
async function signOutFirebase() {
    await signOut(auth);
}

export { getAuthUser, signInGitHub, signOutFirebase }
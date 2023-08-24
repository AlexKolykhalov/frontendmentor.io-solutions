// @ts-check

import {
    onAuthStateChanged,
    signInWithRedirect,
    getRedirectResult,
    signInAnonymously,
    signOut,
    deleteUser,
    getAuth,
    GithubAuthProvider
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

import { auth } from "./init.js"

/**
 * Curry function
 * https://learn.javascript.ru/currying-partials
 * @param {(arg0: any, arg1: any) => any} func
 * @returns
 */
function curry(func) {
    return function (/** @type {any} */ a) {
        return function (/** @type {any} */ b) {
            return func(a, b);
        }
    }
}

const curryOnStateChanged = curry(onAuthStateChanged);
const observerAuthStateChanged = curryOnStateChanged(auth);

/**
 * @returns {Promise<void>} 
 */
async function signInAnonymous() {
    return await signInAnonymously(auth);
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

/**
 * @returns {Promise<void>}
 */
async function deleteFirebaseUser(user) {
    await deleteUser(user);
}

export { observerAuthStateChanged, signInAnonymous, signInGitHub, signOutFirebase, deleteFirebaseUser }
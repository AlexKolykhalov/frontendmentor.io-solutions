// @ts-check

import { FirebaseError } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { DocumentReference, Timestamp, doc, collection, query, where, orderBy, getDocs, getDoc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { db } from "./init.js"

/**
 * Convert Timestamp to string like '2 days ago or 1 hour ago etc.'
 * @param {Timestamp} timestamp 
 * @returns {string}
 */
function timeAgo(timestamp) {
    const createdAt = timestamp.toDate();
    const millsec = Math.floor(Date.now() - createdAt);
    const sec = Math.floor(millsec / 1000);
    const min = Math.floor(sec / 60);
    const h = Math.floor(min / 60);
    const d = Math.floor(h / 24);
    const w = Math.floor(d / 7);
    const m = Math.floor(d / 30);
    const y = Math.floor(m / 12);

    function suffix(num) {
        return num > 1 ? 's' : '';
    }

    if (y > 0) {
        return `${y} year${suffix(y)} ago`;
    } else if (m > 0) {
        return `${m} month${suffix(m)} ago`;
    } else if (w > 0) {
        return `${w} week${suffix(w)} ago`;
    } else if (d > 0) {
        return `${d} day${suffix(d)} ago`;
    } else if (h > 0) {
        return `${h} hour${suffix(h)} ago`;
    } else if (min > 0) {
        return `${min} min${suffix(min)} ago`;
    }
    return 'just now';
}

/**
 * @param {object} obj 
 * @returns {object}
 */
function convert(obj) {
    return {
        content: obj.content ?? '',
        createdAt: obj.createdAt ?? Timestamp.now(),
        replies: obj.replies ?? [],
        replyingTo: obj.replyingTo ?? null,
        score: obj.score ?? 0,
        user: {
            id: obj.user.id ?? null,
            photoUrl: obj.user.photoUrl ?? null,
            username: obj.user.username ?? null,
        }
    };
}

/**
 * Execute query in CloudFirestore 
 * @param {string} leftValue Name of field in CloudFirestore like 'content', 'createdAt' etc.
 * @param {string} comparisonOperator '==' etc.
 * @param {any} rightValue 
 * @returns {Promise<Array>} 
 */
async function executeQuery(leftValue, comparisonOperator, rightValue) {
    const array = [];
    const q = query(collection(db, 'comments'), where(leftValue, comparisonOperator, rightValue), orderBy('createdAt'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(docSnap => {
        if (docSnap.exists()) {
            const obj = convert(docSnap.data());
            obj.id = docSnap.id;

            array.push(obj);
        }
    });

    return array;
}

/**
 * @param {string|DocumentReference} id 
 * @returns {Promise<object>} data of comment
 */
async function read(id) {
    const docSnap = typeof id === 'string' ?
        await getDoc(doc(db, 'comments', id)) :
        await getDoc(id);
    if (docSnap.exists()) {
        const obj = convert(docSnap.data());
        obj.id = docSnap.id;

        return obj;
    }

    throw new FirebaseError('not-found');
}

/**
 * @param {string} id 
 * @returns {DocumentReference}  
 */
function createRef(id) {
    return doc(db, 'comments', id);
}

/**
 * @param {object} data data of new comment 
 * @returns {Promise<string>} id-key
 */
async function create(data) {
    const ref = await addDoc(collection(db, 'comments'), data);

    return ref.id;
}

/**
 * @param {string|DocumentReference} id 
 * @param {object} data data of new comment 
 * @returns {Promise<void>} 
 */
async function update(id, data) {
    typeof id === 'string' ?
        await updateDoc(doc(db, 'comments', id), data) :
        await updateDoc(id, data);
}

/**
 * @param {string|DocumentReference} id 
 * @returns {Promise<void>} 
 */
async function remove(id) {
    typeof id === 'string' ?
        await deleteDoc(doc(db, 'comments', id)) :
        await deleteDoc(id);
}

export { timeAgo, convert, executeQuery, read, createRef, create, update, remove }
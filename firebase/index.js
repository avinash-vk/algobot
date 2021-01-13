const admin = require("firebase-admin");
const serviceAccount = require("./algobot-creds.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://algobot-a8235-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const users = db.collection("users");
const questions = db.collection("questions");

const SOLVE_QUESTION = async (question_id, user_id, score) => {
  // TODO : CLEAN THIS CODE FFS, DISGUSTING.
  await users.doc(user_id).set({
    id: user_id,
  })
  await users.doc(user_id).update({
    solved_count: admin.firestore.FieldValue.increment(1),
    score: admin.firestore.FieldValue.increment(score),
  })
  await questions.doc(question_id).set({
    id: question_id,
  })
  await questions.doc(question_id).update({
    [`solved_by.${user_id}`]:true
  })
}

const UNSOLVE_QUESTION = async (question_id, user_id, score) => {
  // TODO : CLEAN THIS CODE FFS HIGHEST PRIORITY
  await users.doc(user_id).set({
    id: user_id,
  })
  await users.doc(user_id).update({
    solved_count: admin.firestore.FieldValue.increment(-1),
    score: admin.firestore.FieldValue.increment(-score),
  })
  await questions.doc(question_id).set({
    id: question_id,
  })
  await questions.doc(question_id).update({
    [`solved_by.${user_id}`]:false
  })
}

const GET_USER_STATUS = async (user_id) => {
  return await users.doc(user_id).get().then(doc => {
    if(doc.exists){
      return doc.data();
    }
    else {
      return null;
    }
  }).catch(err => console.log(err));
}

const GET_QUESTION_STATUS = async (question_id) => {
  return await questions.doc(question_id).get().then(doc => {
    if(doc.exists){
      return doc.data();
    }
    else {
      return null;
    }
  }).catch(err => console.log(err));
}

module.exports = {
  GET_USER_STATUS,
  GET_QUESTION_STATUS,
  SOLVE_QUESTION,
  UNSOLVE_QUESTION
}

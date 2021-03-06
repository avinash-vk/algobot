const admin = require("firebase-admin");
require("dotenv").config();
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_CREDS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://algobot-a8235-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const users = db.collection("users");
const questions = db.collection("questions");

const SOLVE_QUESTION = async (question_id, user_id, score) => {
  // TODO : CLEAN THIS CODE FFS, DISGUSTING.
  let check = await users.doc(user_id).get();
  if (!check.exists){
    await users.doc(user_id).set({
      id: user_id,
    })
  }
  check = await questions.doc(question_id).get();
  if (!check.exists){
    await questions.doc(question_id).set({
      id: question_id,
    })
  }
  let question = (await questions.doc(question_id).get()).data()
  if (!question[`solved_by.${user_id}`]){
    await questions.doc(question_id).update({
      [`solved_by.${user_id}`]:true
    })
    await users.doc(user_id).update({
      solved_count: admin.firestore.FieldValue.increment(1),
      score: admin.firestore.FieldValue.increment(score),
    })
  }
}

const UNSOLVE_QUESTION = async (question_id, user_id, score) => {
  // TODO : CLEAN THIS CODE FFS HIGHEST PRIORITY
  let check = await users.doc(user_id).get();
  if (!check.exists){
    await users.doc(user_id).set({
      id: user_id,
    })
  }

  check = await questions.doc(question_id).get();
  if (!check.exists){
    await questions.doc(question_id).set({
      id: question_id,
    })
  }
  let question = (await questions.doc(question_id).get()).data()
  if (question[`solved_by.${user_id}`] != false){
    await questions.doc(question_id).update({
      [`solved_by.${user_id}`]:false
    })
    await users.doc(user_id).update({
      solved_count: admin.firestore.FieldValue.increment(-1),
      score: admin.firestore.FieldValue.increment(-score),
    })
  }
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

const GET_LEADERBOARD = async (user_ids) => {
  return await users.where("id","in",user_ids).get().then(docs => {
    return docs.docs.map(doc => doc.data());
  }).catch(err => console.log(err));
}

module.exports = {
  GET_USER_STATUS,
  GET_QUESTION_STATUS,
  SOLVE_QUESTION,
  UNSOLVE_QUESTION,
  GET_LEADERBOARD
}

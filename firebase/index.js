const admin = require("firebase-admin");
const serviceAccount = require("./algobot-creds.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://algobot-a8235-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const users = db.collection("users");
const questions = db.collection("questions");

const SOLVED_QUESTION = async (question_id, user_id, score) => {
  await users.child(user_id).update({
    id: user_id,
    solved_count: db.FieldValue.increment(1),
    score: db.FieldValue.increment(score),
  })
  await questions.doc(question_id).update({
    id: question_id,
    `solved_by.${user_id}`:true
  })
}

const GET_USER_STATUS = async (user_id) => {
  let data = await users.doc(user_id).get();
  return data;
}

const GET_QUESTION_STATUS = async (question_id) => {
  let data = await users.doc(user_id).get();
  return data;
}

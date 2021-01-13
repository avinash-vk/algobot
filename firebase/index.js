const admin = require("firebase-admin");
const serviceAccount = require("./algobot-creds.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://algobot-a8235-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
module.exports = db;

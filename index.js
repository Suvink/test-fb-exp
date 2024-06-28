const express = require('express');
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const app = express();
const port = 8000;
const bodyParser = require("body-parser");

const serviceAccount = require("public/service-account.json");
app.use(bodyParser.json());
initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "uom-session-completed.firebaseio.com"
});

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get("/people", (req, res) => {
    const db = getFirestore();
    const items = db.collection("people");
    items.get().then((querySnapshot) => {
        const itemsArray = [];
        querySnapshot.forEach((doc) => {
            itemsArray.push(doc.data());
        });
        res.send(itemsArray);
    });
});

app.post("/people", (req, res) => {
    console.log(req.body)
    const db = getFirestore();
    const items = db.collection("people");
    items.add(req.body).then(() => {
        res.send("Document successfully written!");
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
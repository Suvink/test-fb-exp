const express = require('express');
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const bodyParser = require("body-parser");
const serviceAccount = require("./service-account.json");

const port = 8000;
const app = express();
app.use(bodyParser.json());

initializeApp({
    credential: cert(serviceAccount),
    // <FIREBASE_PROJECT_ID>.firebaseio.com
    databaseURL: "uom-session-completed.firebaseio.com"
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const authHandler = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        return next();
    } else {
        res.status(401);
        res.send({
            message: "Unauthorized",
            error: "Access token is missing or invalid."
        });
    }
}

app.get("/people", (req, res) => {
    try {
        const db = getFirestore();
        const items = db.collection("people");
        items.get().then((querySnapshot) => {
            const itemsArray = [];
            querySnapshot.forEach((doc) => {
                itemsArray.push(doc.data());
            });
            res.send(itemsArray);
        });
    } catch (error) {
        res.status(500);
        res.send({
            message: "An error occurred while fetching people",
            error: error
        });
    }
});

app.post("/people", authHandler, (req, res) => {

    let person = req.body;
    if (!person.name || !person.company) {
        res.status(400);
        res.send({
            message: "Name and company are required fields."
        });
        return;
    }

    try {
        const db = getFirestore();
        const items = db.collection("people");
        items.add(req.body).then(() => {
            res.send({
                message: "Document successfully written!",
                person: person
            });
        });
    } catch (error) {
        res.status(500);
        res.send({
            message: "An error occurred while adding a person",
            error: error
        });
    }
});

app.listen(port, () => {
    console.log(`People Manager listening on port ${port}`)
});
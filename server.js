const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const shortId = require("shortid");
const UserModel = require("./models/UserModel");
const ExcerciseModel = require("./models/ExcerciseModel");

const cors = require("cors");

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MLAB_URI || "mongodb://localhost/exercise-track", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Database Connected..."))
  .catch(error => {
    console.log("Not Connected...");
    console.log(error);
  });

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", (req, res) => {
  const username = req.body.username;

  UserModel.findOne({ username }, (err, doc) => {
    if (err) return res.json({ err });
    if (doc) res.json({ error: "username already taken" });

    const userId = shortId.generate();
    const new_username = new UserModel({ username, userId });
    new_username.save();

    return res.json({ username, _id: userId });
  }).catch(err => res.json({ error: err.message }));
});

app.post("/api/exercise/add", (req, res) => {
  let newData = req.body;
  UserModel.findOne({ userId: newData.userId }, (err, doc) => {
    if (err) return res.json(err);

    if (!doc) return res.json({ error: "userId does not exist." });

    newData = new ExcerciseModel(newData);
    newData.save()
      .then(doc => {
        return res.json({
          userId: doc.userId,
          description: doc.description,
          duration: doc.duration,
          date: doc.date
        });
      })
      .catch(err => res.json(err.message))

  });
});

app.get('/api/exercise/log/:userId/:from/:to/:limit', (req, res) => {
  const { userId, from, to, limit } = req.params;

  UserModel.findOne({ userId }, (err, doc) => {
    if (err) return res.json(err);

    if (!doc) return res.json({ error: "userId does not exist." });

    ExcerciseModel.find({})
      .where({ userId })
      .where({ date: { $gte: new Date(from), $lte: new Date(to) } })
      .limit(limit)
      .then(docs => res.json(docs))
      .catch(err => res.json({ error: err.message }))

    return res.json(exercises);
  })
})

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

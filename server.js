const express = require("express");
var bcrypt = require("bcryptjs");
const cors = require("cors");
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '',
    database : 'facerecognition'
  }
})

const app = express();
app.use(express.json());
app.use(cors());

const database = {
  users: [
    {
      id: "123",
      name: "John",
      email: "john@gmail.com",
      password: "cookies",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "124",
      name: "Amin",
      email: "amin@gmail.com",
      password: "bananas",
      entries: 0,
      joined: new Date(),
    },
  ],
};

const { users } = database;

const findAndUpdateUser = (res, id, putRequest) => {
  let found = false;
  users.forEach((user) => {
    if (user.id === id) {
      found = true;
      putRequest && user.entries++;
      return res.json(user);
    }
  });

  !found && res.status(400).json("not found");
};

// app.get("/", (req, res) => {
//   res.json(users);
// });

app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  email === users[0].email && password === users[0].password
    ? res.json(users[0])
    : res.status(400).json("error logging in!");
});

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: "125",
    name: name,
    email: email,
    password: hash,
    entries: 0,
    joined: new Date(),
  };
  users.push(newUser);

  res.json(users[users.length - 1]);
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;

  findAndUpdateUser(res, id, false);
});

app.put("/image", (req, res) => {
  const { id } = req.body;

  findAndUpdateUser(res, id, true);
});

app.listen(3000, () => {
  console.log("app is running on port 3000");
});

const express = require("express");
var bcrypt = require("bcryptjs");
const cors = require("cors");
const { dbUrl, port } = require("./config");
const knex = require("knex")({
  client: "pg",
  connection: dbUrl,
  // connection: {
  //   host : '127.0.0.1',
  //   user : 'postgres',
  //   password : 'AmenTest',
  //   database : 'clarifai'
  // }
});

const app = express();
app.use(express.json());
app.use(cors());

// app.get("/", (req, res) => {
//   res.json(users);
// });

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await knex
      .select("email", "hash")
      .from("login")
      .where("email", "=", email);

    const isValid = bcrypt.compareSync(password, response[0].hash);
    if(isValid) {
      try {
        const [user] = await knex
        .select('*')
        .from('users')
        .where("email", "=", email);
        res.json(user);
      } catch(err) {
        res.status(400).json("unable to get the user");
      } 
    } else {
      res.status(400).json("wrong credentials");
    }
  } catch (err) {
    res.status(400).json("wrong credentials");
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);

  try {
    await knex.transaction(async (trx) => {
      await trx
        .insert({
          hash: hash,
          email: email,
        })
        .into("login"); // this is another syntax for(knex('users').insert or trx('users').insert)

      const response = await trx("users")
        .insert({
          name: name,
          email: email, // entries defaults to zero so we dont have to add it here
          joined: new Date(),
        })
        .returning("*");
      res.json(response[0]);
      await trx.commit();
    }); // we can now use trx object instead of knex to show everything we do is a transaction
  } catch (err) {
    await trx.rollback();
    res.status(400).json("unable to register");
  }
});

app.get("/profile/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await knex.select("*").from("users").where({
      id: id,
    });
    user ? res.json(user) : res.status(400).json("not found");
  } catch (err) {
    res.status(400).json("error getting user");
  }
});

app.put("/image", async (req, res) => {
  const { id } = req.body;

  // where({id: id}) we could have done it with object
  try {
    const [user] = await knex("users")
      .where("id", "=", id)
      .increment("entries", 1)
      .returning("*"); // returning('entries')
    user ? res.json(user) : res.status(400).json("not found");
  } catch (err) {
    res.status(400).json("error getting user");
  }
});

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

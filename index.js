const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let users = {};
let exercises = {};
let userIdCounter = 1;

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const userId = (userIdCounter++).toString();

  users[userId] = { username, _id: userId };
  res.json(users[userId]);
});

app.get("/api/users", (req, res) => {
  res.json(Object.values(users).map(user => ({
    username: user.username,
    _id: user._id
  })));
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  if (!users[_id]) {
    return res.json({ error: "User not found!" });
  }

  const formattedDate = date ? new Date(date).toDateString() : new Date().toDateString();
  const exercise = { description,
                     duration: Number(duration),
                     date: formattedDate
  };
  
  if (!exercises[_id]) {
    exercises[_id] = [];
  }
  exercises[_id].push(exercise);

  res.json({
    username: users[_id].username,
    _id,
    ...exercise
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  if (!users[_id]) {
    return res.json({ error: "User not found!" });
  }

  let logs = exercises[_id] || [];

  if (from) {
    logs = logs.filter(log => new Date(log.date) >= new Date(from));
  }
  if (to) {
    logs = logs.filter(log => new Date(log.date) <= new Date(to));
  }
  if (limit) {
    logs = logs.slice(0, Number(limit));
  }

  res.json({
    username: users[_id].username,
    count: logs.length,
    _id,
    log: logs
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

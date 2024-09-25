const express = require("express");
let morgan = require('morgan')
const app = express();
const cors = require('cors')

let people = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
  {
    id: "5",
    name: "Something",
    number: "123456789",
  },
];

app.use(express.json());
app.use(cors());

morgan.token('type', function (req, res) { return JSON.stringify(req.body) })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

app.get("/", (req, res) => {
  res.json(people);
});

// app.get("/people", (req, res) => {
//   res.json(people);
// });

// app.get("/info", (req, res) => {
//   res.send(
//     `<div><p>Phonebook has info for ${
//       people.length
//     } people</p> <p>${new Date().toString()}</p></div>`
//   );
// });

// app.get("/people/:id", (request, response) => {
//   const id = request.params.id;
//   const person = people.find((person) => person.id === id);

//   if (person) {
//     response.json(person);
//   } else {
//     response.status(404).end();
//   }
// });

app.post("/people", (request, response) => {
  const body = request.body;

  const newId = Math.floor(Math.random() * 1000);

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  if (people.find((person) => person.name === body.name)) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const person = request.body;
  person.id = String(newId);

  people = people.concat(person);

  response.json(person);
});

app.put("/people/:id", (request, response) => {
  const id = request.params.id;
  let found = people.filter((person, i) => {
    if(person.id === id) {
      return i
    }
  });
  people[found] = request.body 
  response.status(204).end();
});

app.delete("/people/:id", (request, response) => {
  const id = request.params.id;
  people = people.filter((person) => person.id !== id);
  response.status(204).end();
});


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

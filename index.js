require("dotenv").config();
const express = require("express");
let morgan = require("morgan");
const app = express();
const cors = require("cors");
const Contact = require("./models/contact");

// Middlewares
app.use(express.static("dist"));
app.use(express.json());
app.use(cors());
morgan.token("type", function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :type")
);

// GET all people
app.get("/people", (req, res) => {
  Contact.find({}).then((result) => {
    res.json(result);
  });
});

app.get("/people/:id", (request, response, next) => {
  Contact.findById(request.params.id)
    .then((contact) => {
      if (contact) {
        response.json(contact);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// PUT to update person
app.put("/people/:id", (request, response, next) => {
  const { name, number } = request.body

  Contact.findByIdAndUpdate(request.params.id, { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then((updatedContact) => {
      response.json(updatedContact);
    })
    .catch((error) => next(error)); // pass error to error handler
});

// POST new person
app.post("/people", (request, response, next) => {
  // added next
  const body = request.body;

  if (body.name === undefined || body.number === undefined) {
    console.log("Content missing");

    return response.status(400).json({ error: "content missing" });
  }

  Contact.find({ name: body.name }).then((result) => {
    if (result.length > 0) {
      console.log("found duplicate");
      return response.status(400).send({ error: "Contact already exists" });
    }

    const contact = new Contact({
      name: body.name,
      number: body.number,
    });

    contact
      .save()
      .then((savedContact) => {
        response.json(savedContact);
      })
      .catch((error) => next(error)); // pass error to error handler
  });
});

// DELETE person
app.delete("/people/:id", (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// Error Handling
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

// Server listening
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

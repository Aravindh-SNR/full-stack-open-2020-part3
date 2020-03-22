const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const Person = require('./models/person');

const app = express();

// Custom Morgan token
morgan.token('post', (request, response) => JSON.stringify(request.body));

// Middlewares
app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'));

// Get all persons in phonebook
app.get('/api/persons', (request, response, next) => {
    Person.find()
    .then(persons => response.json(persons))
    .catch(next);
});

// Get number of persons in phonebook and time of request
app.get('/info', (request, response, next) => {
    Person.find()
    .then(persons => {
        response.send(`
            <p>Phonebook has ${persons.length} contacts at the moment.</p>
            <p>${new Date()}</p>
        `);
    })
    .catch(next);
});

// Get one person from phonebook
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        person ? 
        response.json(person) : 
        response.status(404).json({error: 'Person with given id does not exist'});
    })
    .catch(next);
});

// Delete a person from phonebook
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(next);
});

// Add a person to phonebook
app.post('/api/persons', (request, response, next) => {
    const {name, number} = request.body;
    
    const person = new Person({name, number});

    person.save()
    .then(newPerson => response.json(newPerson))
    .catch(next);
});

// Update number of an already existing person
app.put('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndUpdate(request.params.id, {number: request.body.number}, {new: true, runValidators: true})
    .then(updatedPerson => response.json(updatedPerson))
    .catch(next);
});

// Middleware to handle unknown endpoints
const handleUnknownEndpoint = (request, response) => {
    response.status(404).json({error: 'Unknown endpoint'});
};

app.use(handleUnknownEndpoint);

// Middleware to handle errors
const handleErrors = (error, request, response, next) => {
    console.log(error.message);

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).json({error: 'Incorrect id format'});
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message});
    }

    next(error);
};

app.use(handleErrors);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Listening to requests on port ${PORT}`);
});
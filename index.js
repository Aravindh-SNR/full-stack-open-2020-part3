const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Custom Morgan token
morgan.token('post', (request, response) => JSON.stringify(request.body));

// Middlewares
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'));
app.use(cors());

let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    },
    {
        name: "Kent C. Dodds",
        number: "0-123465789",
        id: 5
    },
    {
        name: "Martin Fowler",
        number: "123-456-789",
        id: 6
    }
];

// Function to generate id for new persons
const generateId = () => Math.floor(Math.random() * 1000);

// Get all persons
app.get('/api/persons', (request, response) => {
    response.json(persons);
});

// Get number of persons and time of request
app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has ${persons.length} contacts at the moment.</p>
        <p>${new Date()}</p>
    `);
});

// Get one person
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id);

    person ? response.json(person) : response.status(404).json({error: `Person with given id does not exist.`});
});

// Delete a person
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);

    response.status(204).end();
});

// Add a person
app.post('/api/persons', (request, response) => {
    const {name, number} = request.body;
    
    if (!name || !number) {
        return response.status(400).json({error: 'Name or Number missing.'});
    }

    if (persons.some(person => person.name === name)) {
        return response.status(400).json({error: 'Given name already exists in the phonebook.'});
    }

    const newPerson = {
        id: generateId(),
        name,
        number
    };
    persons = persons.concat(newPerson);
    response.json(newPerson);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening to requests on port ${PORT}`);
});
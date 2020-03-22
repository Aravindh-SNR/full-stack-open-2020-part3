const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// MongoDB URI
const uri = process.env.MONGODB_URI;

// Connect to MongoDB via Mongoose
mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.log('Error connecting to MongoDB:', error.message));

// Define Mongoose schema and add toJSON to transform objects after querying db and before sending response
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is missing'],
        minlength: [3, 'Name should be at least 3 characters long'],
        unique: true
    },
    number: {
        type: String,
        required: [true, 'Number is missing'],
        validate: {
            validator: input => input.match(/\d/g).length >= 8,
            message: 'Phone number should have at least 8 digits'
        }
    }
}, {
    toJSON: {
        transform: (document, returnedObject) => {
            returnedObject.id = returnedObject._id.toString();
            delete returnedObject._id;
            delete returnedObject.__v;
        }
    }
});

// POST request with duplicate name throws a ValidationError that can be caught in our error-handling middleware
personSchema.plugin(uniqueValidator);

// Export Mongoose model
module.exports = mongoose.model('Person', personSchema);
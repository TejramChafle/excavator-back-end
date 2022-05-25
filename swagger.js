
// Swagger document
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    info: {
        title: 'Excavator Node API',
        version: '1.0.0',
        description: 'Excavator RESTful API documentation with Swagger.',
    },
    host: 'localhost:3000',
    basePath: '/'
};

// options for the swagger docs
const options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./routes/*.js'],
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
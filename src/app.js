const express = require('express');
const cors = require('cors');
const path = require('path');

const routes = require('./routes');

const {
    swaggerUi,
    swaggerDocument
} = require('./docs/swagger');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


// Documentacion Swagger
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
)

// rutas de la api
app.use('/api', routes);

module.exports = app;
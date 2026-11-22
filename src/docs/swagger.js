const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const docsPath = __dirname;

const files = fs.readdirSync(docsPath).filter(file => file.endsWith('.yaml'));

const paths = {};
const components = {};

files.forEach(file => {
    const content = fs.readFileSync(path.join(docsPath, file), 'utf8');

    const document = yaml.load(content);

    Object.assign(paths, document.paths || {});
    Object.assign(components, document.components || {});
});

const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'API de Doris',
        version: '1.0.0',
        description: 'Documentación de la API de Doris',
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 5000}`,
            description: 'Servidor local',
        }
    ],
    paths: paths,
    components: components
};

module.exports = {
    swaggerUi,
    swaggerDocument
}
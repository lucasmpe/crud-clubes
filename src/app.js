import express from 'express';
import { create } from 'express-handlebars';
import * as fs from 'fs';

import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PUERTO = 8080;
const app = express();
const hbs = create();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    const data = fs.readFileSync('./data/equipos.json');
    const equipos = JSON.parse(data);

    res.render('home', { equipos });
});

app.listen(PUERTO);
console.log(`Escuchando en http://localhost:${PUERTO}`);

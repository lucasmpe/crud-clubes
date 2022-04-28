import express from 'express';
import multer from 'multer';
import { create } from 'express-handlebars';
import * as fs from 'fs';

import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PUERTO = 8080;
const app = express();
const hbs = create();
const upload = multer({ dest: 'uploads/imagenes' });

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  const data = fs.readFileSync('./data/equipos.json');
  const teams = JSON.parse(data);  
  res.render('home', { teams });
});

app.get('/club/:tla', (req, res) => {
  console.log(req.params)
  const data = fs.readFileSync(`./data/equipos/${req.params.tla}.json`);
  const team = JSON.parse(data);
  res.render('club', { team });
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.post('/create', upload.single('shield'), (req, res) => {

  /* Toma los datos del form y crea un objeto newTeam */
  let newTeam = JSON.parse(JSON.stringify(req.body));
  newTeam.tla = newTeam.name.slice(0, 3).toUpperCase();

  if (typeof req.file !== 'undefined') {
    newTeam.crestUrl = `../${req.file.path}`;
  }

  /* Crea un archivo con la información del newTeam */
  try {
    fs.writeFileSync(`./data/equipos/${newTeam.tla}.json`, JSON.stringify(newTeam));
    console.log('The file was created successfully!');
  } catch (err) {
    console.error(err);
  }

  /* Agreaga newTeam al archivo 'equipos.json' sobreescribiendolo */
  const data = fs.readFileSync('./data/equipos.json');
  const teams = JSON.parse(data);
  teams.push(newTeam);
  
  try {
    fs.writeFileSync('./data/equipos.json', JSON.stringify(teams));
    console.log('The team was appended to file!');
  } catch (err) {
    console.error(err);
  }

  res.render('create', {
    data: {
      message: 'The team was created successfully',
      tlaNewTeam: newTeam.tla
    }
  });
});


app.get('/delete/:tla', (req, res) => {
  
  const data = fs.readFileSync('./data/equipos.json');
  const teams = JSON.parse(data);

  const tlaTeam = req.params.tla;

  try {
    fs.unlinkSync(`./data/equipos/${tlaTeam}.json`);
    console.log('File deleted!');
  } catch (err) {
    console.error(err);
  }

  const team = teams.find(team => team.tla === tlaTeam)
  try {
    fs.unlinkSync(team.crestUrl.slice(3));
    console.log('Image deleted!');
  } catch (err) {
    console.error(err);
  }

  const newTeams = teams.filter(team => team.tla !== tlaTeam);
  try {
    fs.writeFileSync('./data/equipos.json', JSON.stringify(newTeams));
    console.log('The team was deleted from file!');
  } catch (err) {
    console.error(err);
  }

  res.redirect('/'); 
});

app.get('/edit/:tla', (req, res) => {
  const data = fs.readFileSync(`./data/equipos/${req.params.tla}.json`);
  const team = JSON.parse(data);

  res.render('edit', {
    data: {
      team,
      foundedIsNotEmpty: !isNaN(team.founded)
    }
  });
});

app.post('/edit', upload.single('shield'), (req, res) => {

    /* Toma los datos del form y crea un objeto newTeam */
    console.log(req.body)
    let newTeam = JSON.parse(JSON.stringify(req.body));
    newTeam.tla = newTeam.name.slice(0, 3).toUpperCase();
  
    if (typeof req.file !== 'undefined') {
      newTeam.crestUrl = `../${req.file.path}`;
    }
  
    /* Crea (sobreescribe) un archivo con la información del newTeam */
    try {
      fs.writeFileSync(`./data/equipos/${newTeam.tla}.json`, JSON.stringify(newTeam));
      console.log('The file was edited successfully!');
    } catch (err) {
      console.error(err);
    }
  
    /* Agreaga newTeam al archivo 'equipos.json' sobreescribiendolo */
    const data = fs.readFileSync('./data/equipos.json');
    const teams = JSON.parse(data);
    teams.push(newTeam);
    
    try {
      fs.writeFileSync('./data/equipos.json', JSON.stringify(teams));
      console.log('The team was appended to file!');
    } catch (err) {
      console.error(err);
    }


  res.render('edit', {
    data: {
      message: 'The team was edited successfully',
      tlaNewTeam: newTeam.tla
    }
  });

});

app.listen(PUERTO);
console.log(`Escuchando en http://localhost:${PUERTO}`);

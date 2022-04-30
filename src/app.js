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
  try {
    const data = fs.readFileSync('./data/equipos.json');
    const teams = JSON.parse(data);
    res.render('home', { teams });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'something blew up' });
  }
});

app.get('/club/:id', (req, res) => {
  try {
    const data = fs.readFileSync(`./data/equipos.json`);
    const teams = JSON.parse(data);
    const team = teams.find(team => team.id === Number(req.params.id));
    res.render('club', { team });
  } catch (err) {
    console.log(err);
    res.redirect('/')
  }
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.post('/create', upload.single('shield'), (req, res) => {
  try {
    const data = fs.readFileSync('./data/equipos.json');
    const teams = JSON.parse(data);
    const newTeam = {
      id: Math.floor((Math.random() * 2000) + 1000),
      area: {
        id: '',
        name: req.body.country
      },
      name: req.body.name,
      shortName: req.body.name.split(' ')[0],
      tla: req.body.name.slice(0, 3).toUpperCase(),
      crestUrl: req.file ? `../${req.file.path}` : '../data/empty-shield.png',
      address: req.body.address,
      phone: req.body.phone,
      website: req.body.website,
      email: req.body.email,
      founded: req.body.founded,
      clubColors: '',
      venue: req.body.venue,
      lastUpdated: new Date().toISOString()
    };
    teams.push(newTeam);
    fs.writeFileSync('./data/equipos.json', JSON.stringify(teams));
    console.log('The team was appended to file!');
    res.render('create', {
      data: {
        message: 'The team was created successfully',
        id: newTeam.id
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'something blew up' });
  }
});

app.get('/edit/:id', (req, res) => {
  try {
    const data = fs.readFileSync(`./data/equipos.json`);
    const teams = JSON.parse(data);
    const team = teams.find(team => team.id === Number(req.params.id));
    res.render('edit', { team });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

app.post('/edit/:id', upload.single('shield'), (req, res) => {
  try {
    const data = fs.readFileSync('./data/equipos.json');
    const teams = JSON.parse(data);
    const actualTeam = teams.find(team => team.id === Number(req.params.id));
    const indexTeam = teams.findIndex(team => team.id === Number(req.params.id));
    const teamEdited = {
      id: Number(req.params.id),
      area: {
        id: '',
        name: req.body.country
      },
      name: req.body.name,
      shortName: req.body.name.split(' ')[0],
      tla: req.body.name.slice(0, 3).toUpperCase(),
      crestUrl: req.file ? `../${req.file.path}` : '../data/empty-shield.png',
      address: req.body.address,
      phone: req.body.phone,
      website: req.body.website,
      email: req.body.email,
      founded: req.body.founded,
      clubColors: '',
      venue: req.body.venue,
      lastUpdated: new Date().toISOString()
    };
    teams.splice(indexTeam, 1, teamEdited);
    if (/^\.\.\/uploads\/imagenes/.test(actualTeam.crestUrl)) {
      fs.unlinkSync(actualTeam.crestUrl.slice(3));
      console.log('Image deleted!');
    }
    fs.writeFileSync(`./data/equipos.json`, JSON.stringify(teams));
    console.log('The file was edited successfully!');
    res.render('edit', {
      data: {
        message: 'The team was edited successfully',
        id: teamEdited.id
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'something blew up' });
  }
});

app.get('/delete/:id', (req, res) => {
  try {
    const data = fs.readFileSync('./data/equipos.json');
    const teams = JSON.parse(data);
    const teamDelet = teams.find(team => team.id === Number(req.params.id));
    const newTeams = teams.filter(team => team.id !== Number(req.params.id));
    if (/^\.\.\/uploads\/imagenes/.test(teamDelet.crestUrl)) {
      fs.unlinkSync(teamDelet.crestUrl.slice(3));
      console.log('Image deleted!');
    }
    fs.writeFileSync('./data/equipos.json', JSON.stringify(newTeams));
    console.log('The team was deleted from file!');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'something blew up' });
  }
});

app.listen(PUERTO);
console.log(`Escuchando en http://localhost:${PUERTO}`);

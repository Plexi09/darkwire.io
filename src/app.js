import _ from 'underscore';
import express from 'express';
import mustacheExpress from 'mustache-express';
import Io from 'socket.io';
import http from 'http';
import shortid from 'shortid';
import favicon from 'serve-favicon';
import compression from 'compression';
import fs from 'fs';

import Room from './room';

let usage = 0;

const $CONFIG = {
  port: process.env.port || 3000
};

const app = express();
const server = http.createServer(app);
const io = Io(server);

let rooms = [];

app.use(compression());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

function generateNewRoom(req, res, id) {
  const room = new Room(io, id);
  rooms.push(room);
  console.log(`rooms created: ${usage++}`);

  return res.redirect(`/${id}`);
}

app.get('/', (req, res) => generateNewRoom(req, res, 'lobby') );

app.get('/:roomId', (req, res) => {
  const roomId = req.params.roomId || false;

  let roomExists = _.findWhere(rooms, {_id: roomId}) || false;

  if (roomExists) {
    return res.render('index', {
      APP: {
        version: process.env.npm_package_version,
        ip: req.headers['x-forwarded-for']
      },
      username: shortid.generate()
    });
  }

  return generateNewRoom(req, res, roomId);
});

server.listen($CONFIG.port, () => {
  console.log(`darkwire is online on port ${$CONFIG.port}.`);
});

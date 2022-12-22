var express = require("express"),
  port = 8000,
  app = express(),
  mongoose = require("mongoose"),
  session = require("express-session"),
  MongoStore = require("connect-mongodb-session")(session),
  fs = require('fs'),
  dotenv = require('dotenv').config(), db, serverDomain,
  connectionString = process.env.db2;

//session create
var store = new MongoStore({
  uri: connectionString,
  databaseName: 'connect_mongodb_session_test',
  collection: 'sessions',
  connectionOptions: {
    domainsEnabled: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: false,
    sslCA: `${__dirname}/certs/tlsca.pem`,
    sslKey: fs.readFileSync(`${__dirname}/certs/tlsckf.pem`),
  }
});
store.on('error', function (error) {
  console.log(error);
});
app.use(session({
  secret: "sessionSecret",
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60
  },
  resave: true,
  saveUninitialized: true,
}),
);

//creating domain and creating db connection
app.use(function (req, res, next) {
  serverDomain = require('domain').create();
  db = mongoose.createConnection(connectionString, { domainsEnabled: true, useNewUrlParser: true, useUnifiedTopology: true, ssl: true, sslValidate: false, sslCA: `${__dirname}/certs/tlsca.pem`, sslKey: fs.readFileSync(`${__dirname}/certs/tlsckf.pem`) });
  db.on("error", function (err) { console.log(err) });
  db.on("connected", function () { console.log("connection connected") });
  serverDomain.session = req.session;
  serverDomain.run(function () {
    process.domain.add(req)
    process.domain.add(res)
    process.domain.enter()
    process.domain.req = req;
    process.domain.res = res;
    process.domain.session = req.session;
    next()
  });
})

//session
app.get('/', function (req, res) {
  res.send('Hello <br>' + JSON.stringify(req.session.id) + '<br>' + JSON.stringify(req.session));
});

app.listen(port, function () {
  console.log("http://localhost:" + port + "/");
});

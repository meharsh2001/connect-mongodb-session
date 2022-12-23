var express = require("express"),
  port = 8000,
  app = express(),
  mongoose = require("mongoose"),
  session = require("express-session"),
  MongoStore = require("connect-mongodb-session")(session),
  fs = require('fs'),
  dotenv = require('dotenv').config(), db, serverDomain,
  connectionOption = {
    domainsEnabled: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: false,
    sslCA: `${__dirname}/certs/tlsca.pem`,
    sslKey: fs.readFileSync(`${__dirname}/certs/tlsckf.pem`) 
  },
  connectionString = process.env.db2;

//session create
var store = new MongoStore({
  uri: connectionString,
  databaseName: 'connect_mongodb_session_test',
  collection: 'sessions',
  connectionOptions: connectionOption
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
  db = mongoose.createConnection(connectionString,connectionOption);
  db.on("error", function (err) { console.log(err) });
  db.on("connected", function () { console.log(req.url,"connection connected") });
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
  db.close(function () { console.log(req.url,'connection closed') });
  serverDomain.exit();
  res.send('Hello <br>' + JSON.stringify(req.session.id) + '<br>' + JSON.stringify(req.session));
});

//shouldStayInCorrectDomainForReadCommand
app.get('/read', function (req, res) {
  var domain = process.domain;
  var collection = db.collection('sessions');
  collection.countDocuments({}, function (err, data) {
    if (err) { console.log(err) };
    if (process.domain === domain) { console.log("same domain") };
    try { 
      if (process.domain !== domain && domain.req.url) { console.log("not in same domain", process.domain.req.url) };
    } catch (e) {console.log(req.url,"domain not found") }
      res.send('Hello <br>' + JSON.stringify(req.session.id) + '<br>' + JSON.stringify(req.session));
    db.close(function () { console.log(req.url,'connection closed with data:', data) });
    serverDomain.exit();
  });
});

//shouldStayInCorrectDomainForWriteCommand
app.get('/write', function (req, res) {
  var collection = db.collection('sessions');
  collection.insertOne({ field: 123 }, function (err, data) {
    res.send('Hello <br>' + JSON.stringify(req.session.id) + '<br>' + JSON.stringify(req.session));
    db.close(function () { console.log(req.url,'connection closed with data:', data.insertedId) });
    serverDomain.exit();
  });
});

app.listen(port, function () {
  console.log("http://localhost:" + port + "/");
});

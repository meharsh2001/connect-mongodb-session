var express = require("express"),
  port = 8000,
  app = express(),
  mongoose = require("mongoose"),
  session = require("express-session"),
  MongoStore = require("connect-mongodb-session")(session),
  fs = require("fs"),
  dotenv = require("dotenv").config(),
  db,
  serverDomain,
  connectionOption = {
    domainsEnabled: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: false,
    sslValidate: false,
    sslCA: `${__dirname}/certs/tlsca.pem`,
    sslKey: fs.readFileSync(`${__dirname}/certs/tlsckf.pem`),
  },
  connectionString = process.env.db2;

//session create
var store = new MongoStore({
  uri: connectionString,
  databaseName: "connect_mongodb_session_test",
  collection: "sessions",
  connectionOptions: connectionOption,
});
store.on("error", function (error) {
  console.log(error);
});
app.use(
  session({
    secret: "sessionSecret",
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
    resave: true,
    saveUninitialized: true,
  })
);

//creating domain and creating db connection
app.use(function (req, res, next) {
  serverDomain = require("domain").create();
  db = mongoose.createConnection(connectionString, connectionOption);
  db.on("error", function (err) {
    console.log(err);
  });
  db.on("connected", function () {
    serverDomain.session = req.session;
    serverDomain.run(function () {
      process.domain.add(req);
      process.domain.add(res);
      process.domain.req = req;
      process.domain.res = res;
      process.domain.session = req.session;
      process.domain.session.user = {
        id: 123,
        userid: "test",
      };
      domainCheck(req, process.domain, "onvisit", next);
    });
  });
});

//session
app.get("/", function (req, res) {
  res.redirect("/read");
  db.close();
  serverDomain.exit();
});

//shouldStayInCorrectDomainForReadCommand
app.get("/read", function (req, res) {
  var collection = db.collection("sessions");
  collection.countDocuments({}, function (err, data) {
    if (err) {
      console.log(err);
    }
    domainCheck(req, process.domain, data, function () {
      res.redirect("/write");
      db.close();
      serverDomain.exit();
    });
  });
});

//shouldStayInCorrectDomainForWriteCommand
app.get("/write", function (req, res) {
  var collection = db.collection("sessions");
  collection.insertOne({ field: 123 }, function (err, data) {
    if (err) {
      console.log(err);
    }
    domainCheck(req, process.domain, data.insertedId, function () {
      res.redirect("/response");
      db.close();
      serverDomain.exit();
    });
  });
});

app.get("/response", function (req, res) {
  if (connectionOption.domainsEnabled)
    res.send(
      "Hello <br>" +
        JSON.stringify(req.session.id) +
        "<br>" +
        JSON.stringify(req.session)
    );
  else {
    connectionOption.domainsEnabled = true;
    console.log("");
    console.log(
      "domainsEnabled:" +
        connectionOption.domainsEnabled +
        "  http://localhost:" +
        port +
        "/"
    );
    res.redirect("/");
  }
});

function domainCheck(req, currentDomain, data, cb) {
  if (serverDomain === currentDomain) {
    print(req.url, "same domain", data);
  }
  if (!currentDomain) {
    print(req.url, "domain not exist", data);
  }
  if (
    currentDomain &&
    serverDomain !== currentDomain &&
    currentDomain.req.url
  ) {
    print(currentDomain.req.url, "domain not matched");
  }
  return cb();
}

function print(currentUrl, message, outputData) {
  console.log(
    JSON.stringify({
      URL: currentUrl,
      MESSAGE: message,
      DATA: outputData,
    })
  );
}

app.listen(port, function () {
  console.log("");
  console.log(
    "domainsEnabled:" +
      connectionOption.domainsEnabled +
      "  http://localhost:" +
      port +
      "/"
  );
});

var express         =require("express"),
    port            =8000,
    app             =express(),
    session         =require("express-session"),
    MongoStore = require("connect-mongodb-session")(session),
    fs = require('fs'),
    dotenv =require('dotenv').config(),
    connectionString=process.env.db2;

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
store.on('error', function(error) {
    console.log(error);
  });
  
app.use(session({
    secret:"sessionSecret",
    store: store,
      cookie: {
        maxAge: 1000
      },
      resave: true,
      saveUninitialized: true,
    }),
  );

//HOME
app.get('/', function(req, res) {
  res.send('Hello <br>'+ JSON.stringify(req.session.id) + '<br>' + JSON.stringify(req.session));
});

app.listen(port,function()
{
    console.log("http://localhost:"+port+"/");
});

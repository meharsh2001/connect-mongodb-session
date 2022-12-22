var express         =require("express"),
    port            =8000,
    app             =express(),
    domain          =require('domain'),
    mongoose        =require("mongoose"),
    session         =require("express-session"),
    MongoStore = require("connect-mongodb-session")(session),
    fs = require('fs'),
    dotenv =require('dotenv').config(),database,
    connectionString=process.env.db2;

mongoose.createConnection(connectionString,{
    domainsEnabled: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: false,
    sslCA: `${__dirname}/certs/tlsca.pem`,
    sslKey: fs.readFileSync(`${__dirname}/certs/tlsckf.pem`),
  }).then(function(connection) {
    this.connection = connection;
    this.connection.connectionUri = connectionString;
    this.connection.on('error', function(err){ console.log(err); });
    this.connection.once('error', function(err){ console.log(err); }); 
    this.updatedAt = new Date();
    this._models = {};
    this.connection.db.command({ buildInfo: 1 }, (error, info) => {
      if (error) {
        console.log(error);
      } 
      this.mongoVersion = info.version;
      database = this;
      console.log("success");
    });
  }.bind(this));
 
var store = new MongoStore({
    uri: connectionString,
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

app.use(function(req,res,next){
    var serverDomain = domain.create();
    serverDomain.session = req.session;
    serverDomain.run(function () {
        next()
      });
})

//HOME
app.get('/', function(req, res) {
  res.send('Hello <br>'+ JSON.stringify(req.session.id) + '<br>' + JSON.stringify(req.session));
});

app.listen(port,function()
{
    console.log("http://localhost:"+port+"/");
});

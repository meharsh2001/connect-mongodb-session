var express         =require("express"),
    port            =8000,
    app             =express(),
    domain          =require('domain'),
    mongoose        =require("mongoose"),
    session         =require("express-session"),
    MongoStore = require("connect-mongodb-session")(session),
    dotenv =require('dotenv').config();

var connectionString=process.env.db;

mongoose.createConnection(connectionString,{
    domainsEnabled: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
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
      } else {
        console.log("success");
        this.mongoVersion = info.version;
      } 
    });
  }.bind(this));
 
var store = new MongoStore({
    uri: connectionString,
    collection: 'sessions',
    connectionOptions: {
      domainsEnabled: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
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
    serverDomain.add(req);
    serverDomain.add(res);
    serverDomain.session = req.session;
    serverDomain.on('error',next);
    serverDomain.run(next);
})

//HOME
app.get('/', function(req, res) {
  res.send('Hello <br>'+ JSON.stringify(req.session.id) + '<br>' + JSON.stringify(req.session));
});

app.listen(port,function()
{
    console.log("http://localhost:"+port+"/");
});

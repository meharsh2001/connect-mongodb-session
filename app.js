var express         =require("express"),
    port            =8000,
    app             =express(),
    domain          =require('domain'),
    mongoose        =require("mongoose"),
    session         =require("express-session"),
    MongoStore = require("connect-mongodb-session")(session),
    connectionString="mongodb://localhost:27017/connect-mongodb-session"

mongoose.createConnection(connectionString,{
    domainsEnabled: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(function(connect){
    console.log("success")
}.bind(this)); 

app.use(session({
    key:"connect.mongodb.session",
    secret:"sessionSecret",
    store: new MongoStore({
        uri: db.conn.connectionUri,
        connectionOptions: {
          domainsEnabled: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      }),
      resave: true,
      cookie: {
        signed: true,
        secureProxy: false,
      },
      saveUninitialized: true,
    }),
  );

app.use(function(req,res,next){
    var serverDomain = domain.create();
    serverDomain.add(req);
    serverDomain.add(res);
    serverDomain.sesssion = req.sesssion;
    serverDomain.on('error',next);
    serverDomain.run(next);
})

//HOME
app.get("/",function(req,res)
{   
    console.log('home')
});

app.listen(port,function()
{
    console.log("http://localhost:"+port+"/");
});

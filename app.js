var express         =require("express"),
    port            =8000,
    app             =express()

//HOME
app.get("/",function(req,res)
{   
    console.log('home')
});

app.listen(port,function()
{
    console.log("http://localhost:"+port+"/");
});

Files:
    .env :
        db2=mongodb://localhost:27017/connect_mongodb_session_test

    app.js :
        Work flow:
            "/" visit
                domain create
                connect to database with ssl and options
                call domain.run() when connected
                redirect to "/read"
                close database connection
                exit domain
            "/read" visit
                domain create
                connect to database with ssl and options
                call domain.run() when connected
                domainCheck() on done perform read from db
                domainCheck() after read from db
                redirect to "/write"
                close database connection
                exit domain
            "/write" visit
                domain create
                connect to database with ssl and options
                call domain.run() when connected
                domainCheck() on done perform write to db
                domainCheck() after write to db
                redirect to "/response"
                close database connection
                exit domain
            "/response" visit
                note:default domainsEnabled:false
                if true (i.e 2nd visit on route)
                    send response
                else
                    connectionOption.domainsEnabled = true;
                    redirect to "/"
        mongoose connection with domainsEnabled
        mongoose connection with ssl
        use .env for keeping db string
        functions before every route
            session create and store in db
            create domain
            mongoose session create connection
            call domain run when connected to db
        "/" route for session create
        "/read" route to perform read from db operation
        "/write" route to perform write in db operation
        "/response" 
            using default domainsEnabled:false then true
            send session data on frontend if domainEnabled is true
        functions
            domainCheck():
                will check current domain and created domain for route
            print(): will print to console in json format
    connect.js : 
        session create application
        store session in db
        use .env for keeping db string
    
    domain.test.js :
        test cases for domains enabled
        test.ok function
        setup database 
        domain

Modules:
    connect mongo dB session (v3.1.1/v2.4.1) with ssl 
    Express module (v4.18.1) to create app 
    Mongoose module for db connection (v5.8.13) 
    Express session module (v1.17.3) for creating session 
    Domains enabled property 
    Mongoose connection options 
    Session store connection options 
    Node js modules 
        Fs module to get ssl certificates 
        Domain module 

Links:
    GITHUB: 
        https://github.com/meharsh2001/connect-mongodb-session 
    Analysis Sheet:
        https://srrintl-my.sharepoint.com/:x:/r/personal/rekha_srrintl_com/_layouts/15/Doc.aspx?sourcedoc=%7B0D14F5E3-DAED-495A-B628-FAF67B71857F%7D&file=session.xlsx&action=default&mobileredirect=true 
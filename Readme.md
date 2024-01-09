# Connect MongoDB Session

This repository demonstrates the usage of `connect-mongodb-session` with SSL in an Express.js application. The project focuses on efficient session management using MongoDB as the session store, with additional features such as domain handling and MongoDB connection options.

## Files

### 1. `.env`

envCopy code

`db2=mongodb://localhost:27017/connect_mongodb_session_test`

### 2. `app.js`

**Workflow:**

- **"/" Visit:**
  - Create a domain
  - Connect to the database with SSL and options
  - Call `domain.run()` when connected
  - Redirect to "/read"
  - Close the database connection
  - Exit domain
- **"/read" Visit:**
  - Create a domain
  - Connect to the database with SSL and options
  - Call `domain.run()` when connected
  - Call `domainCheck()` on done and perform a read from the database
  - Call `domainCheck()` after reading from the database
  - Redirect to "/write"
  - Close the database connection
  - Exit domain
- **"/write" Visit:**
  - Create a domain
  - Connect to the database with SSL and options
  - Call `domain.run()` when connected
  - Call `domainCheck()` on done and perform a write to the database
  - Call `domainCheck()` after writing to the database
  - Redirect to "/response"
  - Close the database connection
  - Exit domain
- **"/response" Visit:**
  - Note: Default `domainsEnabled: false`
  - If `true` (i.e., the 2nd visit on the route), send a response
  - Else, `connectionOption.domainsEnabled = true;` and redirect to "/"

**Functions:**

- `domainCheck()`: Check the current domain and created domain for the route.
- `print()`: Print to the console in JSON format.

### 3. `connect.js`

- Session create application.
- Store session in the database.
- Use `.env` for keeping the database string.

### 4. `domain.test.js`

- Test cases for domains enabled.
- `test.ok` function.
- Setup database.
- Domain.

## Modules

1. **Connect MongoDB Session**

   - Version: v3.1.1/v2.4.1
   - Purpose: SSL connection to MongoDB for session storage.

2. **Express**

   - Version: v4.18.1
   - Purpose: Create the Express application.

3. **Mongoose**

   - Version: v5.8.13
   - Purpose: MongoDB connection.

4. **Express Session**

   - Version: v1.17.3
   - Purpose: Create sessions.

5. **Domains Enabled Property**

   - Purpose: Enable or disable domains for request handling.

6. **Mongoose Connection Options**

   - Purpose: Define options for Mongoose connections, including SSL.

7. **Session Store Connection Options**

   - Purpose: Define options for the session store (MongoDB connection).

8. **Node.js Modules**

   - Purpose: Core Node.js modules used in the application.
     - `fs`: File system module to get SSL certificates.
     - `domain`: Domain module for handling multiple requests in the same domain.

## Links

- **GitHub Repository:** [connect-mongodb-session](https://github.com/meharsh2001/connect-mongodb-session)
- **Analysis Sheet:** [Session Analysis Sheet](https://srrintl-my.sharepoint.com/:x:/r/personal/rekha_srrintl_com/_layouts/15/Doc.aspx?sourcedoc=%7B0D14F5E3-DAED-495A-B628-FAF67B71857F%7D&file=session.xlsx&action=default&mobileredirect=true)

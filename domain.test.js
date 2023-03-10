'use strict';
var test = function (a) { expect(a).to.be.ok};
var setupDatabase = function setupDatabase(configuration, dbsToClean) {
  dbsToClean = Array.isArray(dbsToClean) ? dbsToClean : [];
  var configDbName = configuration.db;
  var client = configuration.newClient(configuration.writeConcernMax(), {
    maxPoolSize: 1
  });

  dbsToClean.push(configDbName);

  return client
    .connect()
    .then(() =>
      dbsToClean.reduce(
        (result, dbName) =>
          result
            .then(() =>
              client.db(dbName).command({ dropAllUsersFromDatabase: 1, writeConcern: { w: 1 } })
            )
            .then(() => client.db(dbName).dropDatabase({ writeConcern: { w: 1 } })),
        Promise.resolve()
      )
    )
    .then(
      () => client.close(),
      err => client.close(() => Promise.reject(err))
    );
};

  before(function () {
    return setupDatabase(this.configuration);
  });

  it('shouldStayInCorrectDomainForReadCommand', {
    metadata: {
      requires: { topology: ['single', 'replicaset', 'sharded', 'ssl', 'heap', 'wiredtiger'] }
    },

    test: function (done) {
      var Domain = require('domain');
      var domainInstance = Domain.create();
      var configuration = this.configuration;
      var client = configuration.newClient(configuration.writeConcernMax(), {
        poolSize: 1,
        domainsEnabled: true
      });
      client.connect(function (err, client) {
        var db = client.db(configuration.db);
        test.ok(!err);
        var collection = db.collection('test');

        domainInstance.run(function () {
          collection.count({}, function (err) {
            test.ok(!err);
            test.ok(domainInstance === process.domain);
            domainInstance.exit();
            client.close(done);
          });
        });
      });
    }
  });

  it('shouldStayInCorrectDomainForReadCommandUsingMongoClient', {
    metadata: {
      requires: { topology: ['single', 'replicaset', 'sharded', 'ssl', 'heap', 'wiredtiger'] }
    },

    test: function (done) {
      var configuration = this.configuration;
      var Domain = require('domain');
      var domainInstance = Domain.create();

      const client = configuration.newClient({}, { domainsEnabled: true });
      client.connect(function (err, client) {
        test.ok(!err);
        var db = client.db(configuration.db);
        var collection = db.collection('test');
        domainInstance.run(function () {
          collection.count({}, function (err) {
            test.ok(!err);
            test.ok(domainInstance === process.domain);
            domainInstance.exit();
            client.close(done);
          });
        });
      });
    }
  });

  it('shouldStayInCorrectDomainForWriteCommand', {
    metadata: {
      requires: { topology: ['single', 'replicaset', 'sharded', 'ssl', 'heap', 'wiredtiger'] }
    },

    test: function (done) {
      var Domain = require('domain');
      var domainInstance = Domain.create();
      var configuration = this.configuration;
      var client = configuration.newClient(
        { w: 1 },
        { poolSize: 1, auto_reconnect: true, domainsEnabled: true }
      );

      client.connect(function (err, client) {
        test.ok(!err);
        var db = client.db(configuration.db);
        var collection = db.collection('test');
        domainInstance.run(function () {
          collection.insert({ field: 123 }, function (err) {
            test.ok(!err);
            test.ok(domainInstance === process.domain);
            domainInstance.exit();
            client.close(done);
          });
        });
      });
    }
  });

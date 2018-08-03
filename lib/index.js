var _ = require('lodash');
var Sequelize = require('sequelize');
var sequelizeFixtures = require('sequelize-fixtures');
var Umzug = require('umzug');

/**
 * Sets up test database and loads fixtures
 * @param {Object} options
 * @param {Sequelize} options.sequelize Sequelize instance
 * @param {string} options.migrationsPath path to Sequelize migrations
 * @param {string[]} options.fixtures filenames to be loaded by sequelize-fixtures
 * @param {Model[]} options.models Sequelize models to be loaded by sequelize-fixtures
 * @param {boolean} [options.truncate=true] DEPRECIATED all tables are dropped
 * @returns {Promise}
 */
module.exports = function (options) {

  options = _.defaults(options, {
    truncate: true
  });

  var sequelize = options.sequelize;
  var queryInterface = options.sequelize.getQueryInterface();

  // Set up test database and load fixtures
  return emptyDatabase().then(function () {
    return runMigrations();
  }).then(function () {
    return loadFixtures();
  });

  /**
   * Runs migrations on test database.
   * @returns {Promise}
   */
  function runMigrations() {
    var umzug = new Umzug({
      storage: 'sequelize',
      storageOptions: {
        sequelize: sequelize
      },
      migrations: {
        params: [queryInterface, Sequelize],
        path: options.migrationsPath
      }
    });
    return umzug.up();
  }

  /**
   * Drops every table.
   * @returns {Promise}
   */
  function emptyDatabase() {
    return queryInterface.dropAllTables();
  }

  /**
   * Loads fixtures from `fixtures` folder.
   * @returns {Promise}
   */
  function loadFixtures() {
    return sequelizeFixtures.loadFiles(options.fixtures, options.models, {log: _.noop});
  }
};

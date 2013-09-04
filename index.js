/**
 * Module dependencies
 */

var track = require('./track');

/**
 * keep a config
 */

var config = {};

/**
 * Track an event
 *
 * @param {String} event
 */

exports = module.exports = function(event) {
  var data = {
    a: config.app
    e: event,
    u: config.user
  };

  track('//' + config.track, data, config);
};

/**
 * Set a config option
 *
 * @param {String} key
 * @param {Any} value
 */

exports.set = function(key, value) {
  config[key] = value;
};

/**
 * Initialize
 *
 * @param {String} app
 * @param {String} user
 * @param {Object} opts
 */

exports.init = function(app, user, opts) {
  config.app = app;
  config.user = user;
  config.host = opts.host || 'api.pivotapp.io';
  config.track = opts.track || config.host + '/track';
  config.debug = opts.debug || false;
  config.test = opts.test || false;
};

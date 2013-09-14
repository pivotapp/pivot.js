/**
 * Module dependencies
 */

var qs = require('querystring');

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
  if (!config.app || !config.user) throw new Error('pivot not initialized. use `pivot.init(\'app_id\', \'user_id\')`');

  var data = {
    a: config.app,
    e: event,
    u: config.user
  };

  track(config.track, data, config);
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
  opts = opts || {};

  config.app = app;
  config.user = user;
  config.host = opts.host || 'https://api.pivotapp.io';
  config.track = opts.track || config.host + '/track';
  config.debug = opts.debug || false;
  config.test = opts.test || false;
};


function track(url, data, opts) {
  if (opts.test) data['t'] = 1;
  (new Image).src = url + '?' + qs.stringify(data);
};

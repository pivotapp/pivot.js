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

exports = module.exports = function(event, value) {
  var data = {
    e: event,
    i: config.id
  };

  if (value) data.v = value;

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
 * @param {String} id
 * @param {Object} opts
 */

exports.init = function(id, opts) {
  config.id = id;
  config.host = opts.host || '';
  config.track = opts.track || config.host + '/event';
  config.debug = opts.debug || false;
  config.test = opts.test || false;
};

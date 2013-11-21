/**
 * Module dependencies
 */

var parse = require('urlparser').parse;
var qs = require('querystring');
var jsonp = require('jsonp');

/**
 * keep a config
 */

var config = {};

/**
 * Track an event
 *
 * @param {String} event
 */

exports = module.exports = function(event, conf) {
  conf = conf || config;
  if (!conf.app || !conf.user) throw new Error('pivot not initialized. use `pivot.init(\'app_id\', \'user_id\')`');

  var data = {
    a: conf.app,
    e: event,
    u: conf.user
  };

  if (conf.test) data.t = 1;

  if (typeof event === 'string') return track(conf.events, data);

  delete data.e;
  assign(conf.assignments, data, event);
};

/**
 * Alias the main function
 */

exports.assign = exports;
exports.event = exports;

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
  config = defaults(app, user, opts);
  return exports;
};

/**
 * Create an independent client
 */

exports.client = function(app, user, opts) {
  var conf = defaults(app, user, opts);

  return function client(event) {
    return exports(event, conf);
  };
};

function defaults(url, user, opts) {
  opts = opts || {};
  var conf = {};

  url = parse(url);

  conf.url = url;
  conf.app = url.host.username;

  url.host.username = null;

  conf.user = user;
  conf.events = url.toString() + '/events';
  conf.assignments = url.toString() + '/assignments';
  conf.debug = opts.debug || false;
  conf.test = opts.test || false;
  return conf;
}

function track(url, data) {
  (new Image).src = url + '?' + qs.stringify(data);
}

function assign(url, data, fn) {
  url = url + '?' + qs.stringify(data)
  jsonp(url, fn);
}

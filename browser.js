/**
 * Module dependencies
 */

var parser = require('urlparser').parse;
var qs = require('querystring');
var cookie = require('cookie');
var util = require('./util');

/**
 * Record an event or assign the current user a set of bandit/arms
 *
 * @param {String|Function} event
 * @param {Object} conf
 */

exports = module.exports = util.createClient(null, {
  parse: parse,
  get: get,
  token: token()
});


/**
 * Create an independent client
 *
 * @param {String} url
 * @param {Object} opts
 */

exports.client = function(url, opts) {
  opts = opts || {};
  opts.get = opts.get || get;
  opts.token = opts.token || token(opts.cookie);
  opts.parse = opts.parse || parse;
  return util.createClient(url, opts);
};

/**
 * Perform a GET at url with data
 *
 * @param {String} url
 * @param {Object} data
 * @param {Function?} fn
 */

function get(url, data, fn) {
  url = url + '?' + qs.stringify(data);
  if (!fn) return (new Image).src = url;

  var req = cors(url);

  if (!req) return fn(new Error('CORS not supported'));

  req.onload = function() {
    try {
      fn(null, JSON.parse(xhr.responseText));
    } catch (err) {
      fn(err);
    }
  };
  req.onerror = function() {
    fn(new Error('Request could not be completed'));
  };
  req.ontimeout = function() {
    fn();
  };

  req.send();
}

/**
 * Remember a token for a user
 *
 * @param {String} name
 * @return {Function}
 */

function token(name) {
  name = name || 'pivot';
  return function(token, fn) {
    if (typeof token === 'function') return token(null, cookie(name));
    cookie(name, token);
    fn();
  };
}

/**
 * Parse a pivot url
 */

function parse(url) {
  var config = {};
  url = parser(url);
  config.app = url.host.username;
  url.host.username = null;
  config.url = url.toString();
  return config;
}


function cors(url) {
  var xhr = new XMLHttpRequest();
  if ('withCredentials' in xhr) {
    xhr.open('GET', url, true);
    return xhr;
  }
  // IE
  if (typeof XDomainRequest !== 'undefined') {
    xhr = new XDomainRequest();
    xhr.open('GET', url);
    return xhr;
  }
}

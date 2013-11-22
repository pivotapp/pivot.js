
/**
 * Create an independent client
 *
 * @param {String} url
 * @param {Object} opts
 */

exports.createClient = function(url, opts) {
  var config = url ? defaults(url, opts) : { error: error() };

  function client(event) { return pivot(event, config); }

  client.set = function(key, value) {
    config[key] = value;
    if (key === 'silent') config.error = error(value);
  };

  client.init = function(url, userOpts) {
    userOpts = userOpts || opts || {};
    userOpts.parse = userOpts.parse || opts.parse;
    userOpts.get = userOpts.get || opts.get;
    userOpts.token = userOpts.token || opts.token;
    config = defaults(url, userOpts || opts);
  };

  return client;
};

/**
 * Set defaults for the given url/opts
 *
 * @param {String} url
 * @param {Object} opts
 * @return {Object}
 */

function defaults(url, opts) {
  opts = opts || {};
  var config = opts.parse(url);

  config.events = config.url + '/events';
  config.assignments = config.url + '/assignments';
  config.debug = opts.debug || false;
  config.test = opts.test || false;
  config.get = opts.get;
  config.token = opts.token;
  config.error = opts.error || error(opts.silent);
  return config;
}

/**
 * Interact with the pivot clients api
 *
 * @param {String|Function} event
 * @param {Object} config
 */

function pivot(event, config) {
  if (!config.app) return config.error('pivot not initialized. use `pivot.init(\'https://myappid:@clients.pivotapp.io\')`');

  var data = {
    a: config.app,
    e: event
  };
  if (config.test) data.test = 1;

  if (typeof event === 'string') {
    return config.token(function(err, token) {
      if (err) return config.error(err.stack || err);
      if (!token) return config.error('User needs a set of assignments before recording events');
      data.t = token;
      config.get(config.events, data);
    });
  }

  delete data.e;
  config.get(config.assignments, data, function(err, res) {
    if (err) return event(err);
    config.token(res.token, function(err) {
      if (err) return event(err);
      event(null, res.assignments);
    });
  });
}

function error(silent) {
  if (silent || !console || !console.error) return function() {};
  return function(message) {
    console.error(message);
  };
};

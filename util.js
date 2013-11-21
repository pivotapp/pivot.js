
/**
 * Create an independent client
 *
 * @param {String} url
 * @param {Object} opts
 */

exports.createClient = function(url, opts) {
  var config = url ? defaults(url, opts) : {};

  function client(event) { return pivot(event, config); }

  client.set = function(key, value) {
    config[key] = value;
  };

  client.init = function(url, userOpts) {
    userOpts = userOpts || opts || {};
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
  return config;
}

/**
 * Interact with the pivot clients api
 *
 * @param {String|Function} event
 * @param {Object} config
 */

function pivot(event, config) {
  if (!config.app) return console.error('pivot not initialized. use `pivot.init(\'https://myappid:@clients.pivotapp.io\')`');

  var data = {
    a: config.app,
    e: event
  };
  if (config.test) data.t = 1;

  if (typeof event === 'string') return config.get(config.events, data);

  delete data.e;
  config.get(config.assignments, data, function(err, res) {
    if (err) return event(err);
    config.token(res.token, function(err) {
      if (err) return event(err);
      event(null, res.assignments);
    });
  });
}

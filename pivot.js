;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-trim/index.js", function(exports, require, module){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

});
require.register("component-querystring/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var trim = require('trim');

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    obj[parts[0]] = null == parts[1]
      ? ''
      : decodeURIComponent(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
};

});
require.register("kaerus-component-urlparser/index.js", function(exports, require, module){
/**
 * Provides with an Url parser that deconstructs an url into a managable object and back to a string.
 *
 *  ### Examples:
 *  
 *      url = require('urlparser');
 *      
 *      var u = url.parse('http://user:pass@kaerus.com/login?x=42');
 *      
 *      u.host.hostname = 'database.kaerus.com'
 *      u.host.password = 'secret';
 *      u.host.port = 8529;
 *      u.query.parts.push('a=13');
 *      u.toString(); // 'http://user:secret@database.kaerus.com:8529/login?x=42&a=13'
 *      
 * @module  urlparser
 * @name urlparser
 * @main  urlparser
 */

var URL = /^(?:(?:([A-Za-z]+):?\/{2})?(?:(\w+)?:?([^\x00-\x1F^\x7F^:]*)@)?([\w\-\.]+)?(?::(\d+))?)\/?(([^\x00-\x1F^\x7F^\#^\?^:]+)?(?::([^\x00-\x1F^\x7F^\#^\?]+))?(?:#([^\x00-\x1F^\?]+))?)(?:\?(.*))?$/;

function urlString(o){
    var str = "";

    o = o ? o : this;
  
    str+= hostString(o);
    str+= pathString(o);
    str+= queryString(o);

    return str;
}

module.exports.url = urlString;

function hostString(o){
    var str = "";
  
    o = o ? o.host : this.host;

    if(o) {
        if(o.protocol) str+= o.protocol + '://';
        if(o.username) { 
            str+= o.username + (o.password ? ':' + o.password : '') + '@';
        }
        if(o.hostname) str+= o.hostname; 
        if(o.port) str+= ':' + o.port;
    }

    return str;    
}

module.exports.host = hostString;

function pathString(o){
    var str = "";
  
    o = o ? o.path : this.path;

    if(o) {
        if(o.base) str+= '/' + o.base;
        if(o.name) str+= ':' + o.name;
        if(o.hash) str+= '#' + o.hash;
    }

    return str;     
}

module.exports.path = pathString;

function queryString(o){
    var str = "";
    
    o = o ? o.query : this.query;

    if(o) {
        str = "?";
        if(o.parts)
            str+= o.parts.join('&');
    }

    return str;    
}

module.exports.query = queryString;
/**
 * @class  UrlParser
 * @constructor
 * @static
 * @param url {String}
 * @return {Object}
 */
function urlParser(parse) {

    var param, 
        ret = {};

    /**
     * @method  toString 
     * @return {String}
     */
    Object.defineProperty(ret,'toString',{
        enumerable: false,
        value: urlString
    });   

    
    if(typeof parse === 'string') {
        var q, p, u; 

        u = URL.exec(parse);

        /**
         * Host attributes
         *
         *      host: {
         *          protocol: {String}
         *          username: {String}
         *          password: {String}
         *          hostname: {String}
         *          port: {String}
         *      }
         *      
         * @attribute host
         * @type {Object} 
         */

        if(u[1] || u[4]) {
            ret.host = {};

            if(u[1]) ret.host.protocol = u[1];
            if(u[2]) ret.host.username = u[2];
            if(u[3]) ret.host.password = u[3];
            if(u[4]) ret.host.hostname = u[4];
            if(u[5]) ret.host.port = u[5]; 
        }
        /**
         * Path information
         *
         *      path: {
         *          base: {String} // base path without hash
         *          name: {String} // file or directory name
         *          hash: {String} // the #hash part in path
         *      }
         *      
         * @attribute path
         * @type {Object} 
         */

        if(u[6]) {
            ret.path = {};

            if(u[7]) ret.path.base = u[7];
            if(u[8]) ret.path.name = u[8];
            if(u[9]) ret.path.hash = u[9];
        }
        /**
         * Query parameters
         *
         *      query: {
         *          parts: {Array}   // query segments ['a=3','x=2'] 
         *          params: {Object} // query parameters {a:3,x:2}
         *      }
         *      
         * @attribute query
         * @type {Object} 
         */
        if(u[10]) {
            ret.query = {};
            ret.query.parts = u[10].split('&');
            if(ret.query.parts.length) {

                ret.query.params = {};
                ret.query.parts.forEach(function(part){
                    param = part.split('='); 
                    ret.query.params[param[0]] = param[1];   
                });
            }
        }
    }

    return ret; 
}

module.exports.parse = urlParser;
});
require.register("component-cookie/index.js", function(exports, require, module){
/**
 * Encode.
 */

var encode = encodeURIComponent;

/**
 * Decode.
 */

var decode = decodeURIComponent;

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options){
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (null == value) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  return parse(document.cookie);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if ('' == pairs[0]) return obj;
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

});
require.register("pivot/browser.js", function(exports, require, module){
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
  token: token
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

});
require.register("pivot/util.js", function(exports, require, module){

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

});



require.alias("component-querystring/index.js", "pivot/deps/querystring/index.js");
require.alias("component-querystring/index.js", "querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("kaerus-component-urlparser/index.js", "pivot/deps/urlparser/index.js");
require.alias("kaerus-component-urlparser/index.js", "urlparser/index.js");

require.alias("component-cookie/index.js", "pivot/deps/cookie/index.js");
require.alias("component-cookie/index.js", "cookie/index.js");

require.alias("pivot/browser.js", "pivot/index.js");if (typeof exports == "object") {
  module.exports = require("pivot");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("pivot"); });
} else {
  this["pivot"] = require("pivot");
}})();
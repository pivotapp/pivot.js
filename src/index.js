/**
 * Create a Pivot Client
 */

function Client(appId, opts, pending, pendingAssignments) {
  if (!appId) throw new Error('Missing pivot app id');
  opts = opts || {};
  this._u = opts.base || 'https://client.pivotapp.com';
  this._a = appId;
  this._t = !!opts.test;
  this._p = pending || [];

  for (var i = 0, l = (pendingAssignments || []).length; i < l; i++) {
    var a = pendingAssignments[i];
    this.assign(a[0], a[1]);
  }
}

Client.prototype = {
  event: function(event) {
    var self = this;
    var token = self._to;
    if (!token) return self._p.push(event) && self;
    var img = new Image();
    img.src = self._ur('/events', {e: event, t: token});
    return self;
  },
  assign: function(user, cb) {
    if (!user) return cb(null, {});

    var self = this;
    var req = cors(self._ur('/assign', {u: user}));

    if (!req) return cb(new Error('CORS not supported'));

    req.onload = function() {
      try {
        cb(null, self._b(JSON.parse(req.responseText)));
      } catch (err) {
        cb(err);
      };
    };

    // TODO handle errors

    req.send();
    return self;
  },
  _f: function() {
    var self = this;
    var pending = self._p;
    for (var i = 0, l = pending.length; i < l; i++) {
      self.event(pending[i]);
    }
    self._p = [];
  },
  _b: function(body) {
    this._to = body.t;
    this._f();
    return body.a;
  },
  _ur: function(path, obj) {
    obj.a = this._a;
    if (this._t) obj.test = 1;
    return stringify(this._u, path, obj);
  }
};

function stringify(base, path, obj) {
  var qs = [];
  for (var j in obj) {
    qs.push(j + '=' + encodeURIComponent(obj[j]));
  }
  return base + path + '?' + qs.join('&');
};

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

/**
 * Initialize the client
 */

var p = window.pivot || {};

window.pivot = new Client(
  p.a, // app id
  p.o, // options
  p.p, // pending events
  p.s  // pending assignments
);

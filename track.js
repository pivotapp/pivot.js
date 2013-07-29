/**
 * Module dependencies
 */

var xhr = require('xhr');
var qs = require('querystring');

module.exports = function(url, data, opts) {
  if (opts.test) data['t'] = 1;

  var queryUrl = url + '?' + qs.stringify(data);

  if (opts.img) {
    var img = document.createElement('img');
    img.src = queryUrl;
    return document.body.appendChild(img);
  }

  if (xhr && opts.xhr) {
    var req = new XMLHttpRequest();
    req.open('GET', queryUrl, true);
    return req.send(null);
  }

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.defer = true;
  script.src = queryUrl;

  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(script, s);
};

/**
 * Module dependencies
 */

var stack = require('poe-ui-kit');
var envs = require('envs');

var NODE_ENV = envs('NODE_ENV', 'production');
var DEVELOPMENT = NODE_ENV === 'development';
var CACHE_TIME = envs('CACHE_TIME', '60');

/**
 * Expose the app
 */

var app = module.exports = stack();

if (!DEVELOPMENT) app.builder.output.filename = envs('DISABLE_MIN') ? '[name].js' : '[name].min.js';

app.builder.entry = {};
entry('pivot', 'index.js');
entry('snippet', 'snippet.js');

function entry(target, source) {
  source = __dirname + '/src/' + source;
  app.builder.entry[target] = DEVELOPMENT ?
    [source, 'webpack-dev-server/client?http://localhost:' + envs('PORT', '3000'), 'webpack/hot/dev-server'] :
    source;
}

app.get('/', function(req, res) {
  res.render('tests/index');
});

app.get('/assign', function(req, res) {
  res.json({
    t: 'token123',
    a: {
      'feature-1': 'variant-1',
      'feature-2': 'variant-4'
    }
  });
});

app.get('/events', function(req, res) {
  res.set('content-type', 'image/png');
  res.send(204);
});

app.get('/pivot.js', function(req, res) {
  res.redirect('/build/pivot.js');
});

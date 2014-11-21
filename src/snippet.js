(function(win, doc, scriptName, client, appId, opts) {

  var name = 'pivot'
    , eventName = 'event'
    , assignName = 'assign'
    , script = doc.createElement(scriptName)
    , self = document.getElementsByTagName(scriptName)[0];

  var pivot = win[name] = win[name] || {p: [], s: [], a: appId, o: opts};

  pivot[eventName] = pivot[eventName] || function(event) {
    pivot.p.push(event);
  };

  pivot[assignName] = pivot[assignName] || function() {
    pivot.s.push(arguments);
  };

  script.async = 1;
  script.src = client;
  self.parentNode.insertBefore(script, self);

})(window, document, 'script', '//localhost:3000/pivot.js', 'my-app-id');

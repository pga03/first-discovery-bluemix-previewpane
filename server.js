  var host = process.env.VCAP_APP_HOST || "localhost";
  var port = process.env.VCAP_APP_PORT || 3000;
  var connect = require('connect');
  var serveStatic = require('serve-static');
  connect().use(serveStatic(__dirname)).listen(port);
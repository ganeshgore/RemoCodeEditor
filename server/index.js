var http = require('http'),
  app = require('./app');

http.createServer(app).listen(3000, function(){
  console.log('Server listening on port 3000');
});
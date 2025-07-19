const http = require('http');
const soket_io = require('./socket');
const bs = require('./modules/better-sessions');
module.exports = async() => {
    const _session = bs();
    const server = http.createServer();
    server.listen(2556, 'localhost');
    soket_io(server, _session);
};
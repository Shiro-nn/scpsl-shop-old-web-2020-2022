const mongoose = require('mongoose');
const logger = require('./modules/logger');
const config = require('./config');

mongoose.connect(config.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    logger.log('Connected to the MongoDB');
    require('./socket')();
}).catch((err) => console.error(err));

process.on('unhandledRejection', (err) => console.error(err));
process.on('uncaughtException', (err) => console.error(err));
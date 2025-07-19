const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./modules/logger');

const init = async () => {
    mongoose.connect(config.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        logger.log('Connected to the MongoDB');
        try{
            require('./socket.init')();
        }catch(e){
            console.log(e);
        }
    }).catch((err) => {
        logger.error('Unable to connect to the MongoDB. Error: ' + err);
        setTimeout(() => init(), 5000);
    });
};
init();

process.on("unhandledRejection", (err) => console.error(err));
process.on("uncaughtException", (err) => console.error(err));

setInterval(() => {}, 1000);
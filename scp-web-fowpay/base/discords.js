const mongoose = require("mongoose"),
Schema = mongoose.Schema,
config = require("../config.js");
module.exports = mongoose.model("discords", new Schema({
    id: { type: String, default: '114111411444444111' },
    user: { type: String, default: 'fydne' },
    discriminator: { type: String, default: '2500' },
    avatar: { type: String, default: `${config.dashboard.cdn}/scpsl.store/users/avatars/unknow.png` }
}));
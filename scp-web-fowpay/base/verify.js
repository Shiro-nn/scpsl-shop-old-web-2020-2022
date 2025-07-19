const mongoose = require("mongoose"),
Schema = mongoose.Schema;
module.exports = mongoose.model("verify", new Schema({
    id: { type: Number },
    code: { type: String },
}));
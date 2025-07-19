const mongoose = require("mongoose"),
Schema = mongoose.Schema;
module.exports = mongoose.model("sessions", new Schema({
    id: { type: String, default: '' },
    data: { type: String, default: '' },
}));
const mongoose = require("mongoose"),
Schema = mongoose.Schema;
module.exports = mongoose.model("admins", new Schema({
    id: { type: Number, default: 0 },
	sl: {
		type: Object,
		default: {
			trainee: false,
            helper: false,
            mainhelper: false,
            admin: false,
            mainadmin: false,
            selection: false,
            owner: false,
            bans: 0,
            kicks: 0,
            punishments: 0,
            time: 0,
            slaves: 0,
            warnings: 0,
		}
	},
	slhrp: {
		type: Object,
		default: {
			trainee: false,
            helper: false,
            mainhelper: false,
            admin: false,
            mainadmin: false,
            selection: false,
            owner: false,
            bans: 0,
            kicks: 0,
            punishments: 0,
            time: 0,
            slaves: 0,
            warnings: 0,
		}
	},
}));
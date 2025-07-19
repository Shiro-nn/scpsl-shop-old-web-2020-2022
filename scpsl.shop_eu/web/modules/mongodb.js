const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = mongoose.model;

module.exports = {};

module.exports.tps = Model('tps', new Schema({
    server: { type: Number, default: 0 },
    name: { type: String, default: '' },
    ticks: { type: Array, default: [] },
}));

module.exports.payments = Model('payments', new Schema({
    steam: { type: String, default: '' },
    sum: { type: Number, default: 0 },
    code: { type: String, default: '' },
}));

module.exports.accounts = Model('accounts', new Schema({
    steam: { type: String, default: '' },
    balance: { type: Number, default: 0 },
    joined: { type: Number, default: Date.now() },
    prefix: { type: String, default: '' },
    administration: { type: Object, default: {
        owner: false,
        admin: false,
        moderator: false,
    } },
    achievements: { type: Array, default: [] },
    ips: { type: Array, default: [] },
    money: { type: Number, default: 0 },
    lvl: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    to: { type: Number, default: 750 }
}));

module.exports.roles = Model('donate-roles', new Schema({
    owner: { type: String, default: '' },
    sum: { type: Number, default: 0 },
    id: { type: Number, default: 0 },
    expires: { type: Number, default: Date.now() },
    freezed: { type: Boolean, default: false },
    freeze_start: { type: Number, default: 0 },
    freeze_last: { type: Number, default: 0 },
}));

module.exports.builds = Model('donate-builds', new Schema({
    owner: { type: String, default: '' },
    sum: { type: Number, default: 0 },
    expires: { type: Number, default: Date.now() },
    force: { type: Boolean, default: false },
    give: { type: Boolean, default: false },
    effects: { type: Boolean, default: false },
    players_roles: { type: Boolean, default: false },
    prefix: { type: String, default: 'RA' },
    color: { type: String, default: '#d445ff' },
}));

module.exports.customize = Model('donate-customize', new Schema({
    owner: { type: String, default: '' },
    expires: { type: Number, default: Date.now() },
    active: { type: Boolean, default: false },
	sum: {
		type: Object, default: {
            ClassD: 0,
            Scientist: 0,
            Guard: 0,
            Mtf: 0,
            Chaos: 0,
		}
	},
	scales: {
		type: Object, default: {
            ClassD: 100,
            Scientist: 100,
            Guard: 100,
            Mtf: 100,
            Chaos: 100,
		}
	},
	genetics: {
		type: Object, default: {
            ClassD: {
                adrenaline_compatible: false,
                adrenaline_rush: false,
                native_armor: false,
            },
            Scientist: {
                adrenaline_compatible: false,
                adrenaline_rush: false,
                native_armor: false,
            },
            Guard: {
                adrenaline_compatible: false,
                adrenaline_rush: false,
                native_armor: false,
            },
            Mtf: {
                adrenaline_compatible: false,
                adrenaline_rush: false,
                native_armor: false,
            },
            Chaos: {
                adrenaline_compatible: false,
                adrenaline_rush: false,
                native_armor: false,
            },
		}
	},
}));
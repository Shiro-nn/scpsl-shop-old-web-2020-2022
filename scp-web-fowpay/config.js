module.exports = {
	testing: true,
	dashboard: {
		ip: '127.0.0.1', //37.18.21.237
		safe: "https",
		api: 'api.scpsl.store',
		connect: 'connect.scpsl.store',
		baseURL: "localhost",//scpsl.store  localhost beta.scpsl.store
		cdn: "https://cdn.scpsl.store",//https://cdn.fydne.xyz //http://localhost:3000
		socketio: 'https://socket.scpsl.store'
	},
	payments: {
		public: '',
		secret: '',
	},
	SteamAPI: '<pass>',
	token: '<pass>',
	mongoDB: "mongodb://fydne:<pass>@mongo.scpsl.store/login?authSource=admin"
}
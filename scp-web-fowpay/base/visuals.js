const mongoose = require("mongoose"),
Schema = mongoose.Schema;
module.exports = mongoose.model("visuals", new Schema({
      owner: { type: Number, default: 0 },
      sum: { type: Number, default: 0 },
      active: { type: Boolean, default: false },
      expires: { type: Number, default: Date.now() },
    
      root: {
		type: Object,
		default: {
            nimb: false,
            light: false,
            doctor: false,
            flasher: false,
            shooter1: false,
            shooter2: false,
            shooter3: false,
            scp049: false,
            }
      },
	ClassD: {
		type: Object,
		default: {
                  nimb: true,
                  light:{
                      buy: true,
                      color: {r: 255, g: 0, b: 0}
                  },
                  doctor: true,
                  flasher: true,
                  shooter1: true,
                  shooter2: true,
                  shooter3: true,
                  scp049: true,
		}
	},
	Scientist: {
		type: Object,
		default: {
                  nimb: true,
                  light:{
                      buy: true,
                      color: {r: 255, g: 0, b: 0}
                  },
                  doctor: true,
                  flasher: true,
                  shooter1: true,
                  shooter2: true,
                  shooter3: true,
                  scp049: true,
		}
	},
	Guard: {
		type: Object,
		default: {
                  nimb: true,
                  light:{
                      buy: true,
                      color: {r: 255, g: 0, b: 0}
                  },
                  doctor: true,
                  flasher: true,
                  shooter1: true,
                  shooter2: true,
                  shooter3: true,
                  scp049: true,
		}
	},
	MTF: {
		type: Object,
		default: {
                  nimb: true,
                  light:{
                      buy: true,
                      color: {r: 255, g: 0, b: 0}
                  },
                  doctor: true,
                  flasher: true,
                  shooter1: true,
                  shooter2: true,
                  shooter3: true,
                  scp049: true,
		}
	},
	Chaos: {
		type: Object,
		default: {
                  nimb: true,
                  light:{
                      buy: true,
                      color: {r: 255, g: 0, b: 0}
                  },
                  doctor: true,
                  flasher: true,
                  shooter1: true,
                  shooter2: true,
                  shooter3: true,
                  scp049: true,
		}
	},
	Hand: {
		type: Object,
		default: {
                  nimb: true,
                  light:{
                      buy: true,
                      color: {r: 255, g: 0, b: 0}
                  },
                  doctor: true,
                  flasher: true,
                  shooter1: true,
                  shooter2: true,
                  shooter3: true,
                  scp049: true,
		}
	},
}));
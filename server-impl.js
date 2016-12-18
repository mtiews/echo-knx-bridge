var fs = require('fs');
var adapter = require('./knx-adapter');

var CONFIG_FILE_PATH = 'config/knx-config.json';

module.exports = {

	adapter: getAdapter(),

	getAllItems: function() {
		var lights = mapAdapterItems2HueLights(this.adapter.getAllItems());
    	return lights;
	},

	getItem: function(id) {
		var light = mapAdapterItem2HueLight(this.adapter.getItem(id));
    	return light;
	},

	setOnOff: function(id, value) {
		if(this.adapter.supportsOnOff(id)) {
			return this.adapter.setOnOff(id, value);
		}
		else {
			return false;
		}
	},

	setPercentage: function(id, value) {
		if(this.adapter.supportsPercentage(id)) {
			return this.adapter.setPercentage(id, value);
		}
		else {
			return false;
		}
	},

	getAdapterConfig: function() {
		return getAdapterConfiguration();
	},

	saveAdapterConfig: function(config) {
		var result = saveAdapterConfiguration(config);
		this.adapter = null;
		this.adapter = getAdapter();
		return result;
	}

}

function getAdapter() {
	var config = getAdapterConfiguration();
	return new adapter.createInstance(config);
}

function getAdapterConfiguration() {
	return JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'));
}

function saveAdapterConfiguration(config) {
	fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, '\t'));
}

function mapAdapterItems2HueLights(items) {
    var hueLightsMap = {};
    Object.keys(items).forEach(function(id) {
    	hueLightsMap[id] = mapAdapterItem2HueLight(items[id]); 
    });
    var hueLights = {'lights': hueLightsMap};
    return hueLights;
}

function mapAdapterItem2HueLight(item) {
	var huel = JSON.parse(JSON.stringify(hueLightTemplate)); // Clone template
    huel.name = item.name;
    return huel;
}

var hueLightTemplate = {
    "state": {
        "on": true,
        "bri": 254,
        "hue": 15331,
        "sat": 121,
        "xy": [
           0.4448,
            0.4066
        ],
        "ct": 343,
        "alert": "none",
        "effect": "none",
        "colormode": "ct",
        "reachable": true
    },
    "type": "Extended color light",
    "name": "",
    "modelid": "LCT001",
    "swversion": "65003148",
    "pointsymbol": {
        "1": "none",
        "2": "none",
        "3": "none",
        "4": "none",
        "5": "none",
        "6": "none",
        "7": "none",
        "8": "none"
    }
};
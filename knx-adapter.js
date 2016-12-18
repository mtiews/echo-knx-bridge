var knx = require('knx');

function createInstance(configuration) {
	return new KnxAdapter(configuration);
}

function KnxAdapter(configuration) {
	this.config = configuration;
	this.items = this.config.items;
	this.connection = knx.Connection({
		physAddr: '0.0.0',
		handlers: {
			connected: function() {
				console.log('KNX: Connected');
			},
		}
	});
}

KnxAdapter.prototype.getAllItems = function() {

	return this.items;
}

KnxAdapter.prototype.getItem = function(id) {

	return this.items[id];
}

KnxAdapter.prototype.supportsOnOff = function(id) {

	return !!this.items[id].switch_gad;
}

KnxAdapter.prototype.supportsPercentage = function(id) {

	return !!this.items[id].percentage_gad;
}

KnxAdapter.prototype.setOnOff = function(id, value) {
	if(this.supportsOnOff(id)) {
		var gad = this.items[id].switch_gad;
		var val = !!value ? 1 : 0;
		console.log('KNX: Writing ' + gad + ' = ' + val);
		this.connection.write(gad, val, "DPT1.001");
		return true;
	}
	return false;
}

KnxAdapter.prototype.setPercentage = function(id, value) {
	if(this.supportsPercentage(id)) {
		var gad = this.items[id].percentage_gad;
		console.log('KNX: Writing ' + gad + ' = ' + value);
		this.connection.write(gad, value, "DPT5.005");
		return true;
	}
	return false;
}

module.exports.createInstance = createInstance;
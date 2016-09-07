var mongoose = require('mongoose');


var testbedSchema = new mongoose.Schema({
	_id: String,
	user: String,
	devices: [{type: mongoose.Schema.Types.ObjectId, ref: "Device"}]
});

var deviceSchema = new mongoose.Schema({
	port: {type: Number, required: true},
	ip: String,
	permanent: {type: Number, default: 0},
    name: String,
    user: String,
    power: Number,
    rack: String,
    device: String,
    testbed: {type: String, ref: "Testbed"},
    date: Number
})

mongoose.model('Testbed', testbedSchema);
mongoose.model('Device', deviceSchema);

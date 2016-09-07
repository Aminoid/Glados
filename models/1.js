var mongoose = require('mongoose');

var DeviceSchema = new mongoose.Schema({
  
  rack: { type: mongoose.Schema.Types.ObjectId, ref: 'Rack' }
});

mongoose.model('Data', DataSchema);

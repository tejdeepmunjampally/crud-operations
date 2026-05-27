var mongoose = require('mongoose');

var CounterSchema = new mongoose.Schema({
    _id: String,
    seq: { type: Number, default: 0 }
});

var Counter = mongoose.model('Counter', CounterSchema, 'counters');
module.exports = Counter;

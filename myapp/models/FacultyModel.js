var mongoose = require('mongoose');
var Counter = require('./CounterModel');

var FacultySchema = new mongoose.Schema({
    _id: Number,
    name: { type: String, required: true },
    dept: { type: String, required: true }
});

FacultySchema.pre('save', async function () {
    var doc = this;
    if (doc.isNew && (doc._id === undefined || doc._id === null)) {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'facultyid' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );
        doc._id = counter.seq;
    }
});

var Faculty = mongoose.model('Faculty', FacultySchema, 'faculty');
module.exports = Faculty;
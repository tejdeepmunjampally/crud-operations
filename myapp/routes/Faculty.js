var express=require('express');
var Faculty=require('../models/FacultyModel');
var router=express.Router();
router.get('/',async(req,res)=>{
    var Fac=await Faculty.find();
    res.json(Fac);
});
router.get('/:id',async(req,res)=>{
    var Fac=await Faculty.findById(req.params.id);
    res.json(Fac);
});
router.post('/save',async(req,res)=>{
    try {
        const { name, dept } = req.body;
        // stronger validation
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ error: 'name is required (min 2 chars)' });
        }
        if (!dept || typeof dept !== 'string' || dept.trim().length < 2) {
            return res.status(400).json({ error: 'dept is required (min 2 chars)' });
        }
        // allow client to provide numeric _id (optional), otherwise model hook will set it
        const data = { name: name.trim(), dept: dept.trim() };
        if (req.body._id !== undefined) {
            const idNum = Number(req.body._id);
            if (Number.isNaN(idNum) || idNum <= 0) {
                return res.status(400).json({ error: '_id must be a positive number if provided' });
            }
            data._id = idNum;
        }
        var Fac = new Faculty(data);
        await Fac.save();
        res.json(Fac);
    } catch (err) {
        console.error('Error saving Faculty:', err);
        res.status(500).json({ error: err.message });
    }
});
router.put('/update/:id',async(req,res)=>{
    try {
        const { name, dept } = req.body;
        const idNum = Number(req.params.id);
        if (Number.isNaN(idNum) || idNum <= 0) {
            return res.status(400).json({ error: 'id must be a positive number' });
        }
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ error: 'name is required (min 2 chars)' });
        }
        if (!dept || typeof dept !== 'string' || dept.trim().length < 2) {
            return res.status(400).json({ error: 'dept is required (min 2 chars)' });
        }

        const updated = await Faculty.findByIdAndUpdate(
            idNum,
            { name: name.trim(), dept: dept.trim() },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        res.json(updated);
    } catch (err) {
        console.error('Error updating Faculty:', err);
        res.status(500).json({ error: err.message });
    }
});
router.delete('/delete/:id',async(req,res)=>{
    try {
        const idNum = Number(req.params.id);
        if (Number.isNaN(idNum) || idNum <= 0) {
            return res.status(400).json({ error: 'id must be a positive number' });
        }

        const deleted = await Faculty.findByIdAndDelete(idNum);

        if (!deleted) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        res.json({ message: 'Faculty deleted', deleted });
    } catch (err) {
        console.error('Error deleting Faculty:', err);
        res.status(500).json({ error: err.message });
    }
});
module.exports=router;
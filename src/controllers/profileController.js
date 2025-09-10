const Profile = require('../models/Profile');


exports.getProfile = async (req, res, next) => {
    try {
        const profile = await Profile.findOne();
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        next(err);
    }
};


exports.createProfile = async (req, res, next) => {
    try {
        // if profile exists, prevent creating another (single-candidate assumption)
        const existing = await Profile.findOne();
        if (existing) return res.status(400).json({ message: 'Profile already exists' });


        const profile = new Profile(req.body);
        await profile.save();
        res.status(201).json(profile);
    } catch (err) {
        next(err);
    }
};


exports.updateProfile = async (req, res, next) => {
    try {
        const profile = await Profile.findOneAndUpdate({}, req.body, { new: true, upsert: false });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        next(err);
    }
};
const Profile = require('../models/Profile');
const { catchAsyncErrors } = require('../middleware/catchAyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');


module.exports.getProfiles = catchAsyncErrors(async (req, res, next) => {
    const { page = 1, limit = 10, search, skills } = req.query;
    let query = {};

    if (search) {
        query.$text = { $search: search };
    }

    if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        query.skills = { $in: skillsArray };
    }

    const profiles = await Profile.find(query)
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await Profile.countDocuments(query);

    res.json({
        success: true,
        profiles,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    });
});

module.exports.getProfileById = catchAsyncErrors(async (req, res, next) => {
    const profile = await Profile.findById(req.params.id).select('-password');

    if (!profile) {
        return next(new ErrorHandler('Profile not found', 404));
    }

    res.json({
        success: true,
        profile
    });
});


module.exports.getCurrentProfile = catchAsyncErrors(async (req, res, next) => {
    const profile = await Profile.findById(req.id).select('-password');

    if (!profile) {
        return next(new ErrorHandler('Profile not found', 404));
    }

    res.json({
        success: true,
        profile
    });
});

module.exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    if (req.body.password) {
        return next(new ErrorHandler('Password cannot be updated through this route', 400));
    }

    const profile = await Profile.findByIdAndUpdate(
        req.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    ).select('-password');

    if (!profile) {
        return next(new ErrorHandler('Profile not found', 404));
    }

    res.json({
        success: true,
        message: "Profile updated successfully",
        profile
    });
});

module.exports.deleteProfile = catchAsyncErrors(async (req, res, next) => {
    const profile = await Profile.findById(req.id);

    if (!profile) {
        return next(new ErrorHandler('Profile not found', 404));
    }

    await Profile.findByIdAndDelete(req.id);
    res.clearCookie("Token");

    res.json({
        success: true,
        message: "Profile deleted successfully"
    });
});

// Protected route - Update specific fields of profile
// PATCH /api/profiles/skills (requires authentication)
module.exports.updateSkills = catchAsyncErrors(async (req, res, next) => {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
        return next(new ErrorHandler('Skills must be provided as an array', 400));
    }

    const profile = await Profile.findByIdAndUpdate(
        req.id,
        { skills },
        { new: true, runValidators: true }
    ).select('-password');

    if (!profile) {
        return next(new ErrorHandler('Profile not found', 404));
    }

    res.json({
        success: true,
        message: "Skills updated successfully",
        skills: profile.skills
    });
});

// Protected route - Add education entry
// POST /api/profiles/education (requires authentication)
module.exports.addEducation = catchAsyncErrors(async (req, res, next) => {
    const profile = await Profile.findById(req.id);

    if (!profile) {
        return next(new ErrorHandler('Profile not found', 404));
    }

    profile.education.push(req.body);
    await profile.save();

    res.json({
        success: true,
        message: "Education added successfully",
        education: profile.education
    });
});

// Protected route - Add work experience
// POST /api/profiles/work (requires authentication)
module.exports.addWork = catchAsyncErrors(async (req, res, next) => {
    const profile = await Profile.findById(req.id);

    if (!profile) {
        return next(new ErrorHandler('Profile not found', 404));
    }

    profile.work.push(req.body);
    await profile.save();

    res.json({
        success: true,
        message: "Work experience added successfully",
        work: profile.work
    });
});

// Protected route - Update links
// PATCH /api/profiles/links (requires authentication)
module.exports.updateLinks = catchAsyncErrors(async (req, res, next) => {
    const profile = await Profile.findByIdAndUpdate(
        req.id,
        { links: req.body },
        { new: true, runValidators: true }
    ).select('-password');

    if (!profile) {
        return next(new ErrorHandler('Profile not found', 404));
    }

    res.json({
        success: true,
        message: "Links updated successfully",
        links: profile.links
    });
});

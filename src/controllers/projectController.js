const Profile = require('../models/Profile');
const Project = require('../models/Project');

exports.listProjects = async (req, res, next) => {
    try {
        const { skills, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (skills) {
            const skillsArr = skills.split(',').map((s) => s.trim());
            filter.skills = { $in: skillsArr };
        }
        const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const projects = await Project.find(filter).skip(skip).limit(parseInt(limit, 10));
        res.json({ data: projects, page: parseInt(page, 10) });
    } catch (err) {
        next(err);
    }
};

exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id).populate('owner');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        next(err);
    }
};

exports.createProject = async (req, res, next) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (err) {
        next(err);
    }
};

exports.updateProject = async (req, res, next) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        next(err);
    }
};

exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted' });
    } catch (err) {
        next(err);
    }
};

exports.topSkills = async (req, res, next) => {
    // convenience endpoint
    try {
        const project = Project.find()
        const limit = parseInt(req.query.limit || '10', 10);
        const agg = await project.aggregate([
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit }
        ]);
        res.json(agg);
    } catch (err) {
        next(err);
    }
};

exports.searchProjects = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        if (!q || q.trim() === '') return res.status(400).json({ message: 'Query parameter "q" is required' });
        const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const projects = await Project.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(parseInt(limit, 10));
        const profiles = await Profile.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(parseInt(limit, 10));
        res.json({ projects, profiles, page: parseInt(page, 10) });
    } catch (err) {
        next(err);
    }
};

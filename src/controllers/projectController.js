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
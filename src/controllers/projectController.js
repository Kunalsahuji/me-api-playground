const Project = require('../models/Project');
const { catchAsyncErrors } = require('../middleware/catchAyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');

// GET /api/projects
module.exports.getProjects = catchAsyncErrors(async (req, res, next) => {
    const { page = 1, limit = 10, search, skills, owner } = req.query;
    let query = {};

    if (search) {
        query.$text = { $search: search };
    }

    if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        query.skills = { $in: skillsArray };
    }

    if (owner) {
        query.owner = owner;
    }

    const projects = await Project.find(query)
        .populate('owner', 'name email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    res.json({
        success: true,
        projects,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    });
});

// GET /api/projects/:id
module.exports.getProject = catchAsyncErrors(async (req, res, next) => {
    const project = await Project.findById(req.params.id).populate('owner', 'name email');

    if (!project) {
        return next(new ErrorHandler('Project not found', 404));
    }

    res.json({
        success: true,
        project
    });
});

// GET /api/projects/my (requires authentication)
module.exports.getMyProjects = catchAsyncErrors(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;

    const projects = await Project.find({ owner: req.id })
        .populate('owner', 'name email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await Project.countDocuments({ owner: req.id });

    res.json({
        success: true,
        projects,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        message: `Found ${total} projects`
    });
});

// POST /api/projects (requires authentication)
module.exports.createProject = catchAsyncErrors(async (req, res, next) => {
    // Validate required fields
    const { title } = req.body;

    if (!title) {
        return next(new ErrorHandler('Project title is required', 400));
    }

    const project = await Project.create({
        ...req.body,
        owner: req.id
    });

    await project.populate('owner', 'name email');

    res.status(201).json({
        success: true,
        message: 'Project created successfully',
        project
    });
});

// PUT /api/projects/:id (requires authentication)
module.exports.updateProject = catchAsyncErrors(async (req, res, next) => {
    let project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorHandler('Project not found', 404));
    }

    // Check if the project belongs to the logged-in user
    if (project.owner.toString() !== req.id.toString()) {
        return next(new ErrorHandler('You are not authorized to update this project', 403));
    }

    project = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    ).populate('owner', 'name email');

    res.json({
        success: true,
        message: 'Project updated successfully',
        project
    });
});

// DELETE /api/projects/:id (requires authentication)
module.exports.deleteProject = catchAsyncErrors(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorHandler('Project not found', 404));
    }

    // Check if the project belongs to the logged-in user
    if (project.owner.toString() !== req.id.toString()) {
        return next(new ErrorHandler('You are not authorized to delete this project', 403));
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: 'Project deleted successfully'
    });
});

// PATCH /api/projects/:id/skills (requires authentication)
module.exports.updateProjectSkills = catchAsyncErrors(async (req, res, next) => {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
        return next(new ErrorHandler('Skills must be provided as an array', 400));
    }

    let project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorHandler('Project not found', 404));
    }

    // Check ownership
    if (project.owner.toString() !== req.id.toString()) {
        return next(new ErrorHandler('You are not authorized to update this project', 403));
    }

    project = await Project.findByIdAndUpdate(
        req.params.id,
        { skills },
        { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
        success: true,
        message: 'Project skills updated successfully',
        skills: project.skills
    });
});

// PATCH /api/projects/:id/links (requires authentication)
module.exports.updateProjectLinks = catchAsyncErrors(async (req, res, next) => {
    let project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorHandler('Project not found', 404));
    }

    // Check ownership
    if (project.owner.toString() !== req.id.toString()) {
        return next(new ErrorHandler('You are not authorized to update this project', 403));
    }

    project = await Project.findByIdAndUpdate(
        req.params.id,
        { links: req.body },
        { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
        success: true,
        message: 'Project links updated successfully',
        links: project.links
    });
});

// GET /api/projects/search (public but with advanced filters)
module.exports.searchProjects = catchAsyncErrors(async (req, res, next) => {
    const {
        skills,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc',
        minSkills = 1
    } = req.query;

    if (!skills) {
        return next(new ErrorHandler('Skills parameter is required for search', 400));
    }

    const skillsArray = skills.split(',').map(s => s.trim());
    const minSkillsNum = parseInt(minSkills);

    let query = {
        $expr: {
            $gte: [
                { $size: { $setIntersection: ["$skills", skillsArray] } },
                minSkillsNum
            ]
        }
    };

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sortBy]: sortOrder };

    const projects = await Project.find(query)
        .populate('owner', 'name email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort(sortObj);

    const total = await Project.countDocuments(query);

    res.json({
        success: true,
        projects,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        searchCriteria: {
            skills: skillsArray,
            minSkills: minSkillsNum
        }
    });
});


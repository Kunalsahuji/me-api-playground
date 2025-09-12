// const Project = require('../models/Project');

// const getProjects = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search, skills, owner } = req.query;
//         let query = {};

//         if (search) {
//             query.$text = { $search: search };
//         }

//         if (skills) {
//             const skillsArray = skills.split(',').map(s => s.trim());
//             query.skills = { $in: skillsArray };
//         }

//         if (owner) {
//             query.owner = owner;
//         }

//         const projects = await Project.find(query)
//             .populate('owner', 'name email')
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .sort({ createdAt: -1 });

//         const total = await Project.countDocuments(query);

//         res.json({
//             projects,
//             totalPages: Math.ceil(total / limit),
//             currentPage: page,
//             total
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const getProject = async (req, res) => {
//     try {
//         const project = await Project.findById(req.params.id).populate('owner', 'name email');
//         if (!project) return res.status(404).json({ error: 'Project not found' });
//         res.json(project);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const createProject = async (req, res) => {
//     try {
//         const project = await Project.create({
//             ...req.body,
//             owner: req.user._id
//         });

//         await project.populate('owner', 'name email');
//         res.status(201).json(project);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

// const updateProject = async (req, res) => {
//     try {
//         const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
//         if (!project) return res.status(404).json({ error: 'Project not found' });

//         Object.assign(project, req.body);
//         await project.save();
//         await project.populate('owner', 'name email');

//         res.json(project);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

// const deleteProject = async (req, res) => {
//     try {
//         const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
//         if (!project) return res.status(404).json({ error: 'Project not found' });

//         res.json({ message: 'Project deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const getMyProjects = async (req, res) => {
//     try {
//         const { page = 1, limit = 10 } = req.query;

//         const projects = await Project.find({ owner: req.user._id })
//             .populate('owner', 'name email')
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .sort({ createdAt: -1 });

//         const total = await Project.countDocuments({ owner: req.user._id });

//         res.json({
//             projects,
//             totalPages: Math.ceil(total / limit),
//             currentPage: page,
//             total
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports = {
//     getProjects,
//     getProject,
//     createProject,
//     updateProject,
//     deleteProject,
//     getMyProjects
// };

const Project = require('../models/Project');
const { catchAsyncErrors } = require('../middleware/catchAyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');

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

// Protected route - Update own project
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

// Protected route - Delete own project
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

// Protected route - Add skills to project
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

// Protected route - Update project links
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

// Public route - Get projects by specific skills with advanced filtering
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
    
    let query = {
        skills: { 
            $in: skillsArray,
            $size: { $gte: parseInt(minSkills) }
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
            minSkills: parseInt(minSkills)
        }
    });
});

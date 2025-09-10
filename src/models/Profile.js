const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
    degree: String,
    institution: String,
    startYear: Number,
    endYear: Number,
    description: String
});

const WorkSchema = new mongoose.Schema({
    company: String,
    role: String,
    location: String,
    startDate: String,
    endDate: String,
    description: String
});

const LinksSchema = new mongoose.Schema({
    github: String,
    linkedin: String,
    portfolio: String,
    resume: String
});

const ProfileSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        education: [EducationSchema],
        skills: [{ type: String }],
        work: [WorkSchema],
        links: LinksSchema
    },
    { timestamps: true }
);
// text index for search
ProfileSchema.index({ name: 'text', 'education.institution': 'text', 'work.company': 'text' });
ProfileSchema.index({ skills: 1 });


module.exports = mongoose.model('Profile', ProfileSchema);
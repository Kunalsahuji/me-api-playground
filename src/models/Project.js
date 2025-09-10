const mongoose = require('mongoose');


const ProjectSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
        title: { type: String, required: true },
        description: { type: String },
        links: {
            github: String,
            live: String,
            demo: String
        },
        skills: [{ type: String }]
    },
    { timestamps: true }
);


ProjectSchema.index({ skills: 1 });
ProjectSchema.index({ title: 'text', description: 'text' });


module.exports = mongoose.model('Project', ProjectSchema);
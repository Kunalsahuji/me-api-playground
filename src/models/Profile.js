const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
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
let validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};
const ProfileSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: 'Email address is required',
            validate: [validateEmail, 'Please fill a valid email address'],
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        password: {
            type: String,
            required: true,
            select:false,
            minlength: 6,
            password_pattern: /^(?=.*[0-9]) (?=.*[!@#$%^&*]) (?=.*[a-z]) (?=.*[A-Z]) {6} $/,

            validate: {
                validator: (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(pwd),
                message: 'Password must be 6+ chars with uppercase, lowercase, number, and special character'
            },
        },
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


ProfileSchema.pre("save", function () {
    if (!this.isModified("password")) {
        return;
    }
    try {
        let salt = bcrypt.genSaltSync(10)
        this.password = bcrypt.hashSync(this.password, salt)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

ProfileSchema.methods.comparepassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

ProfileSchema.methods.getJWTToken = function () {
    return jwt.sign(
        { id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE }
    )
}

const Profile = mongoose.model('Profile', ProfileSchema);
module.exports = Profile
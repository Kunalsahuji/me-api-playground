const Profile = require('../models/Profile')
const { sendToken } = require('../utils/sendToken')
const { catchAsyncErrors } = require('../middleware/catchAyncErrors')
const ErrorHandler = require('../utils/ErrorHandler')

module.exports.homepage = catchAsyncErrors(async (req, res, next) => {
    res.json({ message: "success!" })
})

module.exports.register = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    const existingUser = await Profile.findOne({ email });
    if (existingUser) return next(new ErrorHandler("User already exists!"))
    const profile = await new Profile(req.body).save()
    const { password: pwd, ...userWithoutPassword } = profile.toObject()

    sendToken(profile, 201, res, userWithoutPassword)
})

module.exports.login = catchAsyncErrors(async (req, res, next) => {
    const profile = await Profile.findOne({ email: req.body.email }).select('+password')
    if (!profile) return next(new ErrorHandler("User Not Found with this email address!", 400))

    const isMatch = await profile.comparepassword(req.body.password)
    if (!isMatch) return next(new ErrorHandler("Wrong Credentials", 401))
    const { password: pwd, ...userWithoutPassword } = profile.toObject()

    sendToken(profile, 200, res, userWithoutPassword)
})

module.exports.currentProfile = catchAsyncErrors(async (req, res, next) => {
    const profile = await Profile.findById(req.id).exec()
    if (!profile) return next(new ErrorHandler("Profile not found", 404))

    const { password: pwd, ...userWithoutPassword } = profile.toObject()

    res.json({ success: true, profile: userWithoutPassword })
})

module.exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.clearCookie("Token")
    res.json({ message: 'User Logged out!' })
})

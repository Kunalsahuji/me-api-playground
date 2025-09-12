module.exports.sendToken = (profile, statusCode, res, profileData) => {
    const token = profile.getJWTToken()
    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
    res.status(statusCode).cookie('Token', token, options).json({
        success: true, profile: profileData || profile, token
    })
}
module.exports.sendToken = (profile, statusCode, res, profileData) => {
    const token = profile.getJWTToken()
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: true
    }
    res.status(statusCode).cookie('json', token, options).json({
        success: true, profile: profileData || profile, token
    })
}
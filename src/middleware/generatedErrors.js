module.exports.generatedErrors = (err, req, res, next) => {
    console.error(err.stack);
    const status = req.status || 500
    res.status(status).json({ message: err.message || 'Internal Server Error' });
}

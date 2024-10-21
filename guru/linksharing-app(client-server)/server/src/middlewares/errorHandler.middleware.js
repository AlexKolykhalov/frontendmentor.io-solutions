export const errorHandler = (err, _, res, __) => {    
    const code = err.status || 500;
    res.status(code).json({
	status: code,
	message: err.message || "Internal Server Error",
    });
};

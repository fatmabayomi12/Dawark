class ApiError extends Error {
    constructor(statsusCode, message) { 
        super(message);
        this.statsusCode = statsusCode;
        this.status = `${statsusCode}`.startsWith(4) ? 'fail' : 'error';
        this.isOperational = true;
    }
} 

export default ApiError;
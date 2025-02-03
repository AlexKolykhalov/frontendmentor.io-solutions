//@ts-check

export class ServerError extends Error {
    constructor(message, status) {
	super(message);
	this.status = status;	
    }

    static badRequest(message) {
	return new ServerError(message, 400);
    }

    static unauthorized(message) {
	return new ServerError(message, 401);
    }

    static notFound(message = "Not found") {
	return new ServerError(message, 404);
    }
    
    static conflict(message) {
	return new ServerError(message, 409);
    }    
}

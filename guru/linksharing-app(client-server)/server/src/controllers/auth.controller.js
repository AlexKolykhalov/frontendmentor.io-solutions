import { AuthService } from "../services/auth.service.js";


class AuthController {
    static async login(req, res, next) {
	try {
	    // before we check our email & passwordh in middleware
	    const { email, password } = req.body;
	    const tokens = await AuthService.login(email, password);
	    res.setCookie("_t2", tokens.refreshToken, { httpOnly: true });
	    return res.send(200).json(token.accessToken);
	} catch (error) {
	    next(error);
	}
    }

    static async signup(req, res, next) {
	try {
	    // before we check our email & passwordh in middleware
	    const { email, password } = req.body;
	    const tokens = await AuthService.signup(email, password);
	    res.setCookie("_t2", tokens.refreshToken, { httpOnly: true });
	    return res.send(201).json(token.accessToken);
	} catch (error) {
	    next(error);
	}
    }

    static async logout(req, res, next) {
	try {
	    // before we check our refreshToken in middleware
	    const { token } = req.body;
	    await AuthService.logout(token);
	    res.deleteCookie("_t2");
	    return res.sendStatus(204);
	} catch (error) {
	    next(error);
	}
    }
}


export { AuthController };

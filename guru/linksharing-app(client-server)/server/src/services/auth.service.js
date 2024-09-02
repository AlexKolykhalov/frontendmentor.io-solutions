class AuthService {
    static async login(email, password) {
	const candidate = await DB.findOne({ where: { email: email }});
	if (!candidate) throw Error("We have not email in DB");
	const result = checkCrypt(password, candidate.password);
	if (!result) throw Error("Password did not match");
	const payload = {};
	const tokens = TokenService.generateTokens(payload);
	return tokens;
    }

    static async signup(email, password) {
	const candidate = await DB.findOne({ where: { email: email }});
	if (candidate) throw Error("We have email in DB");
	const strongPassword = crypt(password, salt);
	const payload = {"email": email, "password": password};
	const user = await UserService.create(payload);
	const tokens = TokenService.generateTokens(payload);
	return tokens;
    }

    static async logout(token) {
	const deleted = await DB.remove({ where: { refresh_token: token }});
	if (deleted === 0) throw Error("Can't find token in DB");
    }
}


export { AuthService };

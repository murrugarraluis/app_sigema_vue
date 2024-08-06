import HttpService from "./HttpService";

export default class AuthService {
    async login(payload) {
        return HttpService.prototype.login('login', payload)
    }

    async logout() {
        return HttpService.prototype.create('logout', [])
    }

    setUserLogged(userLogged) {
        localStorage.setItem("userLogged", JSON.stringify(userLogged));
    }

    getUserLogged() {
        return JSON.parse(localStorage.getItem("userLogged"));
    }

    setToken(token) {
        localStorage.setItem("token", token);
    }

    getToken() {
        return localStorage.getItem("token");
    }
}
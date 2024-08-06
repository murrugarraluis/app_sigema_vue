import HttpService from "./HttpService";

const uri = 'permissions'
export default class PermissionsServices {
    async getAll() {
        return HttpService.prototype.getAll(uri)
    }
}
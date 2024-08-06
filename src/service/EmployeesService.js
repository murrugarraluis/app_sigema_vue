import HttpService from "./HttpService";

const uri = 'employees'
export default class EmployeesService {
    async getAll() {
        return HttpService.prototype.getAll(uri)
    }
    async getAllWithoutUser() {
        let uri2 = uri + '/withoutUser'
        return HttpService.prototype.getAll(uri2)
    }
    async getGenerateSafeCredentials(id) {
        let uril = uri+'/'+id+'/generate-safe-credentials';
        return HttpService.prototype.create(uril)
    }
    async getOne(id) {
        return HttpService.prototype.getOne(uri,id)
    }

    async create(payload) {
        return HttpService.prototype.create(uri, payload)
    }

    async update(id, payload) {
        return HttpService.prototype.update(uri, id, payload)
    }

    async delete(id) {
        return HttpService.prototype.delete(uri, id)
    }
}
import HttpService from "./HttpService";

const uri = 'machines'
export default class MachinesService {
    async getAll() {
        return HttpService.prototype.getAll(uri)
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
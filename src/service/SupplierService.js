import HttpService from "./HttpService";

const uri = 'suppliers'
export default class SupplierService {
    async getAll() {
        return await HttpService.prototype.getAll(uri)
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
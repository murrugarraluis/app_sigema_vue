import HttpService from "./HttpService";

const uri = 'supplier-types'
export default class SupplierTypeServices {
    async getAll() {
        return HttpService.prototype.getAll(uri)
    }
}
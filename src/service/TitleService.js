import HttpService from "./HttpService";

const uri = 'positions'
export default class DocumentTypeServices {
    async getAll() {
        return HttpService.prototype.getAll(uri)
    }
}
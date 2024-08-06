import HttpService from "./HttpService";

const uri = 'document-types'
export default class DocumentTypeServices {
    async getAll() {
        return HttpService.prototype.getAll(uri)
    }
}
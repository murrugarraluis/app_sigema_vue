import HttpService from "./HttpService";

const uri = 'article-types'
export default class ArticleTypesService {
    async getAll() {
        return HttpService.prototype.getAll(uri)
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
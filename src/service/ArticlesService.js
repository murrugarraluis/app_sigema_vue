import HttpService from "./HttpService";

const uri = 'articles'
export default class ArticleService {
    async getAll() {
        return HttpService.prototype.getAll(uri)
    }
    async getAllSparePart() {
        let customUri = uri+'?article_type=Spare Part'
        return HttpService.prototype.getAll(customUri)
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
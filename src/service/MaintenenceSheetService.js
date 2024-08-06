import HttpService from "./HttpService";

const uri = 'maintenance-sheets'
export default class MaintenenaceSheetService {
    async getAll() {
        return HttpService.prototype.getAll(uri)
    }

    async getAllFilterDates(start_date, end_date) {
        let custom_uri = `${uri}?start_date=${start_date}&end_date=${end_date}`
        return HttpService.prototype.getAll(custom_uri)
    }

    async getOne(id) {
        return HttpService.prototype.getOne(uri, id)
    }
    async create(payload) {
        return HttpService.prototype.create(uri, payload)
    }
    async report(payload) {
        let custom_uri = uri + '/pdf'
        return HttpService.prototype.create(custom_uri, payload)
    }
    async reportOne(id) {
        return HttpService.prototype.reportOne(uri, id)
    }
    async delete(id) {
        return HttpService.prototype.delete(uri, id)
    }
}
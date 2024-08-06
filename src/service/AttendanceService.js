import HttpService from "./HttpService";

const uri = 'attendance-sheets'
export default class AttendanceService {
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

    async update(id, payload) {
        return HttpService.prototype.update(uri, id, payload)
    }

    async checkIn(id, payload) {
        let custom_uri = uri + '/' + id + '/check-in'
        return HttpService.prototype.update2(custom_uri, payload)
    }
    async checkOut(id, payload) {
        let custom_uri = uri + '/' + id + '/check-out'
        return HttpService.prototype.update2(custom_uri, payload)
    }
    async justifiedAbsence(id, payload) {
        let custom_uri = uri + '/' + id + '/justified-absence'
        return HttpService.prototype.update2(custom_uri, payload)
    }
    async closed(id) {
        let custom_uri = uri + '/' + id + '/closed'
        let payload = [];
        return HttpService.prototype.update2(custom_uri, payload)
    }

}
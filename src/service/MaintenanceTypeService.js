import HttpService from "./HttpService";

const uri = 'maintenance-types'
export default class MaintenanceTypeService {
    async getAll() {
        return HttpService.prototype.getAll(uri)
    }
}
import HttpService from "./HttpService";

const uri = 'banks'
export default class BankServices {
    async getAll() {
        return HttpService.prototype.getAll(uri)
    }
}
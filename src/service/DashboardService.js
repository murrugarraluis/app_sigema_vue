import HttpService from './HttpService';

const uri = 'dashboard';

export default class DashboardService {
    async getAll() {
        return HttpService.prototype.getAll(uri);
    }
}

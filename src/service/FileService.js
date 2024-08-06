import HttpService from "./HttpService";

const uri = 'files'
export default class FileService {
    async upload(payload) {
        return HttpService.prototype.uploadFile(uri, payload)
    }
}
import HttpService from "./HttpService";

const uri = 'images'
export default class ImageService {
    async upload(payload) {
        return HttpService.prototype.uploadFile(uri, payload)
    }
}
export default class Api {
    constructor (baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }

    _request(method, endpoint, body = null) {
        const url = this.baseUrl + endpoint;
        const opts = {
            method: method,
            headers: {"Authorization": `Token ${this.token}`},
            mode: "cors"
        }
        if (body !== null) {
            opts.body =  JSON.stringify(body)
        }
        return fetch(url, opts).then(result => result.json());
    }

    queryDocuments(offset = 0, limit = 25) {
        return this._request("GET", `/document?offset=${offset}&limit=${limit}`)
    }

    getDocument(id) {
        return this._request("GET", `/document/id/${id}`)
    }

    getSentence(id) {
        return this._request("GET", `/sentence/id/${id}`)
    }

    getConlluMetadata(id) {
        return this._request("GET", `/conllu-metadata/id/${id}`)
    }

    getToken(id) {
        return this._request("GET", `/token/id/${id}`)
    }

    downloadConlluFile(documentId) {
        return this._request("GET", `/files/download/${documentId}`)
    }

}

// for debugging
window.ConlluRestApi = Api;
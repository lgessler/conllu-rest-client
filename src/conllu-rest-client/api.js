export default class Api {
    constructor (baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }

    _request(method, endpoint, body = {}) {
        const url = this.baseUrl + endpoint;
        return fetch(url, {
            method: method,
            headers: {"Authorization": `Token ${this.token}`},
            body: JSON.stringify(body)
        });
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
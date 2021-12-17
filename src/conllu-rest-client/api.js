export default class Api {
    constructor (baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }

    _getRequest(endpoint) {
        const url = this.baseUrl + endpoint;
        const opts = {
            method: "GET",
            headers: {"Authorization": `Token ${this.token}`},
            mode: "cors"
        }
        return fetch(url, opts);
    }

    _postRequest(endpoint, body) {
        const url = this.baseUrl + endpoint;
        const opts = {
            method: "POST",
            headers: {
                "Authorization": `Token ${this.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
            mode: "cors"
        }
        return fetch(url, opts);
    }

    checkToken(token) {
        return this._postRequest("/check-token", {"token": token});
    }

    queryDocuments(offset = 0, limit = 25) {
        return this._getRequest(`/conllu/document?offset=${offset}&limit=${limit}`)
            .then(result => result.json());
    }

    getDocument(id) {
        return this._getRequest(`/conllu/document/id/${id}`)
            .then(result => result.json());
    }

    getSentence(id) {
        return this._getRequest(`/conllu/sentence/id/${id}`)
            .then(result => result.json());
    }

    getConlluMetadata(id) {
        return this._getRequest(`/conllu/conllu-metadata/id/${id}`)
            .then(result => result.json());
    }

    getToken(id) {
        return this._getRequest(`/conllu/token/id/${id}`)
            .then(result => result.json());
    }

    downloadConlluFile(documentId) {
        return this._getRequest(`/conllu/files/download/${documentId}`);
    }

}

// for debugging
window.ConlluRestApi = Api;
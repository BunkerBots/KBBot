/* eslint-disable no-async-promise-executor */
const { MongoClient } = require('mongodb');

class Client {
    constructor(uri, options) {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        this.client = client;
        this.uri = uri;
        this.db = options.db;
        this.coll = options.coll;
        return this;
    }

    connect() {
        return new Promise(async(res, rej) => {
            await this.client.connect().catch(err => {
                return rej(err);
            });
            res(this);
        });
    }

    get(id) {
        return new Promise(async(res, rej) => {
            const get = await this.client.db(this.db).collection(this.coll).findOne({ id: { $eq: id } }).catch(err => {
                return rej(err);
            });
            if (get) {
                res(get);
            } else {
                res(void 0);
            }
        });
    }

    set(id, obj) {
        return new Promise(async(res, rej) => {
            const reply = await this.client.db(this.db).collection(this.coll).updateOne({
                id: { $eq: id },
            }, { $set: obj }, { upsert: true }).catch(error => {
                return rej(error);
            });
            if (reply) {
                res(obj);
            }
            res(void 0);
        });
    }
}

module.exports = Client;
const couchbase = require('couchbase');

let cluster;
let bucket;
let collection;

async function connect() {
    try {
        cluster = await couchbase.connect(process.env.COUCHBASE_URL, {
            username: process.env.COUCHBASE_USERNAME,
            password: process.env.COUCHBASE_PASSWORD,
        });
        bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
        collection = bucket.defaultCollection();
        console.log('Connected to Couchbase Capella');
    } catch (error) {
        console.error('Error connecting to Couchbase:', error);
        throw error;
    }
}

async function getCollection() {
    return collection;
}

module.exports = { connect, getCollection };
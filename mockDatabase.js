class MockDatabase {
  constructor() {
    this.storage = new Map();
  }

  async upsert(key, value) {
    this.storage.set(key, value);
  }

  async get(key) {
    if (this.storage.has(key)) {
      return { content: this.storage.get(key) };
    }
    throw new Error('document not found');
  }
}

let mockDb;

function connect() {
  mockDb = new MockDatabase();
  console.log('Connected to mock database');
}

function getCollection() {
  return mockDb;
}

module.exports = { MockDatabase, connect, getCollection };
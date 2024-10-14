const { connect, getCollection } = require('./database');

console.log('Starting test with mock database connection');

async function runTest() {
  try {
    await connect();
    console.log('Connected to mock database');

    const collection = getCollection();
    await collection.upsert('test::1', { name: 'Test User' });
    const result = await collection.get('test::1');
    console.log('Test document:', result.content);
  } catch (error) {
    console.error('Error during test:', error);
  }
}

runTest()
  .then(() => console.log('Test completed'))
  .catch((error) => console.error('Test failed:', error));
const { MongoClient } = require('mongodb');

const { MONGO_URI, MONGO_DB, MONGO_COLLECTION } = process.env;

const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });

const connectToDb = async () => {
  await client.connect();
  return client.db(MONGO_DB);
};

const getRandomSuggestion = async (db) => {
  const collection = db.collection(MONGO_COLLECTION);
  const suggestions = await collection.find({ archived: false }).toArray();
  if (!suggestions.length) {
    return null;
  }
  const randomIdx = Math.floor(Math.random() * suggestions.length);
  const suggestion = suggestions[randomIdx];
  await collection.updateOne(
    { _id: suggestion._id },
    { $set: { archived: true, archived_at: new Date().toISOString() } }
  );
  return suggestion.text;
};

const addSuggestion = async (suggestion, db) => {
  const doc = {
    text: suggestion,
    created_at: new Date().toISOString(),
    archived_at: null,
    archived: false,
  };
  const collection = db.collection(MONGO_COLLECTION);
  await collection.insertOne(doc);
};


module.exports = {
  connectToDb,
  getRandomSuggestion,
  addSuggestion,
};


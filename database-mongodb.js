// MongoDB数据库连接
const { MongoClient } = require('mongodb');

// MongoDB连接字符串（从环境变量获取）
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'ganzhi_zhimen';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

// 用户管理
async function addUser(userData) {
    const { db } = await connectToDatabase();
    const result = await db.collection('users').insertOne(userData);
    return { ...userData, _id: result.insertedId };
}

async function findUser(query) {
    const { db } = await connectToDatabase();
    return await db.collection('users').findOne({
        $or: [
            { username: query.username },
            { email: query.email },
            { id: query.id }
        ]
    });
}

async function getAllUsers() {
    const { db } = await connectToDatabase();
    return await db.collection('users').find({}).toArray();
}

// 用户资料管理
async function saveProfile(profile) {
    const { db } = await connectToDatabase();
    await db.collection('profiles').updateOne(
        { userId: profile.userId },
        { $set: profile },
        { upsert: true }
    );
    return profile;
}

async function getProfile(userId) {
    const { db } = await connectToDatabase();
    return await db.collection('profiles').findOne({ userId });
}

// 记录管理
async function addRecord(record) {
    const { db } = await connectToDatabase();
    const result = await db.collection('records').insertOne(record);
    return { ...record, _id: result.insertedId };
}

async function getRecordsByUser(userId) {
    const { db } = await connectToDatabase();
    return await db.collection('records').find({ userId }).toArray();
}

async function getAllRecords() {
    const { db } = await connectToDatabase();
    return await db.collection('records').find({}).toArray();
}

// 统计数据
async function getStats() {
    const { db } = await connectToDatabase();
    const totalUsers = await db.collection('users').countDocuments();
    const totalRecords = await db.collection('records').countDocuments();
    const totalProfiles = await db.collection('profiles').countDocuments();
    
    return {
        totalUsers,
        totalRecords,
        totalProfiles
    };
}

module.exports = {
    connectToDatabase,
    addUser,
    findUser,
    getAllUsers,
    saveProfile,
    getProfile,
    addRecord,
    getRecordsByUser,
    getAllRecords,
    getStats
};

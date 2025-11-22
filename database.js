// 简单的内存数据库（用于演示，生产环境应使用真实数据库）
class SimpleDatabase {
    constructor() {
        this.users = [];
        this.records = [];
        this.profiles = [];
    }

    // 用户管理
    addUser(user) {
        this.users.push(user);
        return user;
    }

    findUser(query) {
        return this.users.find(user => 
            user.username === query.username || 
            user.email === query.email ||
            user.id === query.id
        );
    }

    getAllUsers() {
        return this.users;
    }

    // 用户资料管理
    saveProfile(profile) {
        const existingIndex = this.profiles.findIndex(p => p.userId === profile.userId);
        if (existingIndex >= 0) {
            this.profiles[existingIndex] = profile;
        } else {
            this.profiles.push(profile);
        }
        return profile;
    }

    getProfile(userId) {
        return this.profiles.find(p => p.userId === userId);
    }

    // 记录管理
    addRecord(record) {
        this.records.push(record);
        return record;
    }

    getRecordsByUser(userId) {
        return this.records.filter(record => record.userId === userId);
    }

    getAllRecords() {
        return this.records;
    }

    // 统计数据
    getStats() {
        return {
            totalUsers: this.users.length,
            totalRecords: this.records.length,
            totalProfiles: this.profiles.length
        };
    }
}

// 创建全局数据库实例
const db = new SimpleDatabase();

// 添加一些示例数据
db.addUser({
    id: 'demo_user_1',
    username: 'demo',
    email: 'demo@example.com',
    password: '123456',
    createdAt: new Date().toISOString()
});

db.saveProfile({
    userId: 'demo_user_1',
    username: 'demo',
    age: 25,
    gender: '男',
    location: '大城市中心',
    greenLevel: '适中绿色',
    terrain: '平原',
    growthEnv: '城市郊区',
    contactFreq: '每周',
    interests: ['摄影', '植物识别'],
    completedAt: new Date().toISOString()
});

module.exports = db;
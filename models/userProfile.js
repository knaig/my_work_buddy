const { getCollection } = require('../database');

class UserProfile {
    constructor(data) {
        Object.assign(this, data);
        this.onboardingStep = this.onboardingStep || 0;
    }

    static async findByPhoneNumber(phoneNumber) {
        const collection = await getCollection();
        try {
            const result = await collection.get(`user::${phoneNumber}`);
            return new UserProfile(result.content);
        } catch (error) {
            if (error.code === couchbase.errors.keyNotFound) {
                return null;
            }
            throw error;
        }
    }

    async save() {
        const collection = await getCollection();
        await collection.upsert(`user::${this.phoneNumber}`, this);
    }

    async remove() {
        const collection = await getCollection();
        await collection.remove(`user::${this.phoneNumber}`);
    }

    addInteraction(message, response) {
        if (!this.interactionHistory) {
            this.interactionHistory = [];
        }
        this.interactionHistory.push({
            message,
            response,
            timestamp: new Date().toISOString()
        });
        this.lastInteraction = new Date().toISOString();
    }

    addDailyTopic(topic) {
        if (!this.dailyTopics) {
            this.dailyTopics = [];
        }
        this.dailyTopics.push({
            date: new Date().toISOString().split('T')[0],
            topic: topic,
            responses: []
        });
    }

    getLastDailyTopic() {
        if (this.dailyTopics && this.dailyTopics.length > 0) {
            return this.dailyTopics[this.dailyTopics.length - 1].topic;
        }
        return null;
    }
}

module.exports = UserProfile;
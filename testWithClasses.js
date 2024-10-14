const { getCollection } = require('../mockDatabase');
const moment = require('moment');

class UserProfile {
    constructor(data) {
        Object.assign(this, data);
        this.onboardingStep = this.onboardingStep || 0;
    }

    static async findByPhoneNumber(phoneNumber) {
        const collection = getCollection();
        try {
            const result = await collection.get(`user::${phoneNumber}`);
            return new UserProfile(result.content);
        } catch (error) {
            if (error.message === 'document not found') {
                return null;
            }
            throw error;
        }
    }

    async save() {
        const collection = getCollection();
        await collection.upsert(`user::${this.phoneNumber}`, this);
    }

    addInteraction(message, response) {
        if (!this.interactionHistory) {
            this.interactionHistory = [];
        }
        this.interactionHistory.push({
            message,
            response,
            timestamp: moment().toDate()
        });
        this.lastInteraction = moment().toDate();
    }

    addDailyTopic(topic) {
        if (!this.dailyTopics) {
            this.dailyTopics = [];
        }
        this.dailyTopics.push({
            date: moment().format('YYYY-MM-DD'),
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
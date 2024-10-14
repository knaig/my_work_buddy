const natural = require("natural");
const moment = require("moment");
const UserProfile = require("./models/userProfile");

class WorkBuddy {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.initializeClassifier();
        this.onboardingSteps = [
            "greeting",
            "name",
            "jobTitle",
            "company",
            "yearsOfExperience",
            "skills",
            "goals",
            "challenges",
            "workEnvironment",
        ];
    }

    initializeClassifier() {
        // Add more intents and training data
        this.classifier.addDocument("How do I prioritize my tasks?", "task_prioritization");
        this.classifier.addDocument("I am having trouble with a coworker", "interpersonal_issues");
        this.classifier.addDocument("What skills should I focus on?", "skill_development");
        this.classifier.addDocument("I am feeling stressed about work", "emotional_support");
        this.classifier.addDocument("How can I impress my boss?", "career_advancement");
        this.classifier.addDocument("What is my daily topic?", "daily_topic");
        this.classifier.addDocument("Can you review my day?", "day_review");
        this.classifier.train();
    }

    async processMessage(message, userProfile) {
        if (userProfile.onboardingStep < this.onboardingSteps.length) {
            return this.continueOnboarding(message, userProfile);
        }

        const intent = this.classifier.classify(message);
        let response;

        switch (intent) {
            case "task_prioritization":
                response = this.handleTaskPrioritization(userProfile);
                break;
            case "interpersonal_issues":
                response = this.handleInterpersonalIssues(userProfile);
                break;
            case "skill_development":
                response = this.handleSkillDevelopment(userProfile);
                break;
            case "emotional_support":
                response = this.handleEmotionalSupport(userProfile);
                break;
            case "career_advancement":
                response = this.handleCareerAdvancement(userProfile);
                break;
            case "daily_topic":
                response = this.getDailyTopic(userProfile);
                break;
            case "day_review":
                response = this.reviewDay(userProfile);
                break;
            default:
                response = this.handleGeneralInquiry(message, userProfile);
        }

        userProfile.addInteraction(message, response);
        await userProfile.save();

        return response;
    }

    continueOnboarding(message, userProfile) {
        const currentStep = this.onboardingSteps[userProfile.onboardingStep];
        let response;

        switch (currentStep) {
            case "greeting":
                response = "Welcome to Work Buddy! I'm here to help you with your work-related questions and challenges. To get started, could you please tell me your name?";
                break;
            case "name":
                userProfile.name = message;
                response = "Great! What's your job title?";
                break;
            case "jobTitle":
                userProfile.jobTitle = message;
                response = "Thanks! Which company do you work for?";
                break;
            case "company":
                userProfile.company = message;
                response = "How many years of experience do you have in your field?";
                break;
            case "yearsOfExperience":
                userProfile.yearsOfExperience = parseInt(message);
                response = "What are your top skills? (Separate them with commas)";
                break;
            case "skills":
                userProfile.skills = message.split(',').map(skill => skill.trim());
                response = "What are your career goals? (Separate them with commas)";
                break;
            case "goals":
                userProfile.goals = message.split(',').map(goal => goal.trim());
                response = "What challenges are you facing at work? (Separate them with commas)";
                break;
            case "challenges":
                userProfile.challenges = message.split(',').map(challenge => challenge.trim());
                response = "Briefly describe your work environment (e.g., office size, team structure).";
                break;
            case "workEnvironment":
                userProfile.workEnvironment = { description: message };
                response = "Thank you for providing all this information! I'm here to help you with your work-related questions and challenges. Feel free to ask me anything!";
                break;
            default:
                response = "I'm sorry, but I don't have any more onboarding questions. How can I assist you today?";
        }

        userProfile.onboardingStep++;
        return response;
    }

    handleTaskPrioritization(userProfile) {
        return "To prioritize your tasks, consider using the Eisenhower Matrix. Categorize tasks as urgent and important, important but not urgent, urgent but not important, or neither urgent nor important. Focus on the urgent and important tasks first, then move on to the important but not urgent ones.";
    }

    handleInterpersonalIssues(userProfile) {
        return "When dealing with coworker issues, communication is key. Try to have an open and honest conversation with your colleague, focusing on specific behaviors rather than personal attacks. If the issue persists, consider involving your supervisor or HR department for mediation.";
    }

    handleSkillDevelopment(userProfile) {
        return `Based on your current role as a ${userProfile.jobTitle} and your goals, you might want to focus on developing both technical and soft skills. Consider enhancing your ${userProfile.skills[0]} skills and also work on improving your leadership and communication abilities.`;
    }

    handleEmotionalSupport(userProfile) {
        return "It's normal to feel stressed about work sometimes. Remember to take breaks, practice self-care, and maintain a healthy work-life balance. If stress persists, consider talking to a mental health professional or your company's employee assistance program.";
    }

    handleCareerAdvancement(userProfile) {
        return "To impress your boss, focus on delivering high-quality work, meeting deadlines, and showing initiative. Take on additional responsibilities when possible, and keep your boss informed of your achievements. Also, ask for feedback regularly and act on it to show your commitment to growth.";
    }

    getDailyTopic(userProfile) {
        const topics = [
            "Time Management",
            "Effective Communication",
            "Problem-Solving Techniques",
            "Networking Strategies",
            "Work-Life Balance",
        ];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        userProfile.addDailyTopic(randomTopic);
        return `Today's topic is: ${randomTopic}. Would you like some tips on this topic?`;
    }

    reviewDay(userProfile) {
        return "Let's review your day. What were your main accomplishments? Any challenges you faced? How did you handle them? Reflecting on these questions can help you improve and plan for tomorrow.";
    }

    handleGeneralInquiry(message, userProfile) {
        return `I understand you're asking about "${message}". As your AI work buddy, I'm here to help with various work-related topics. Could you please provide more context or specify your question?`;
    }
}

module.exports = WorkBuddy;
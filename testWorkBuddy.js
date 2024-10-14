const WorkBuddy = require("./workBuddy");
const UserProfile = require("./models/userProfile");
const { connect } = require("./mockDatabase");

console.log("Starting testWorkBuddy.js - Onboarding Process");

async function simulateOnboarding(phoneNumber, messages) {
    console.log("Simulating onboarding process");
    await connect();
    console.log("Connected to mock database");
    const workBuddy = new WorkBuddy();
    console.log("WorkBuddy instance created");

    let userProfile = await UserProfile.findByPhoneNumber(phoneNumber);
    if (userProfile) {
        console.log("Removing existing user profile for testing");
        await userProfile.remove();
    }

    for (const message of messages) {
        console.log("\nUser:", message);
        userProfile = await UserProfile.findByPhoneNumber(phoneNumber);
        if (!userProfile) {
            userProfile = new UserProfile({
                phoneNumber: phoneNumber,
                onboardingStep: 0
            });
        }
        const response = await workBuddy.processMessage(message, userProfile);
        console.log("WorkBuddy:", response);
        await userProfile.save();
    }

    console.log("\nFinal User Profile:");
    console.log(await UserProfile.findByPhoneNumber(phoneNumber));
}

async function runTest() {
    const testPhoneNumber = "+1234567890";
    const testMessages = [
        "Hi, I am new here",
        "John Doe",
        "Software Engineer",
        "TechCorp",
        "5",
        "JavaScript, Python, React",
        "Improve leadership skills, Learn machine learning",
        "Time management, Work life balance",
        "Fast-paced startup, 20 team members"
    ];

    try {
        await simulateOnboarding(testPhoneNumber, testMessages);
        console.log("Onboarding test completed successfully");
    } catch (error) {
        console.error("Error during onboarding test:", error);
    }
}

runTest()
    .then(() => console.log("All tests completed"))
    .catch((error) => console.error("Test suite failed:", error));
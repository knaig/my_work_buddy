require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const { connect } = require('./database');
const WorkBuddy = require('./workBuddy');
const UserProfile = require('./models/userProfile');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Connect to Couchbase Capella
connect().then(() => {
    console.log('Connected to Couchbase Capella');
}).catch((err) => {
    console.error('Failed to connect to Couchbase Capella', err);
    process.exit(1);
});

app.post('/webhook', async (req, res) => {
    const { From, Body } = req.body;
    console.log('Message received:', Body);

    try {
        const workBuddy = new WorkBuddy();
        const userProfile = await UserProfile.findByPhoneNumber(From) || new UserProfile({ phoneNumber: From });
        
        const response = await workBuddy.processMessage(Body, userProfile);
        await userProfile.save();

        await sendWhatsAppMessage(From, response);
        console.log('Response sent:', response);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: "An error occurred while processing your message." });
    }
});

async function sendWhatsAppMessage(to, message) {
    try {
        await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${to}`,
            body: message
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
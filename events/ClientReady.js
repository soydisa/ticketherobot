const { Events, ActivityType } = require('discord.js');
const { MongoClient } = require('mongodb')
const mongoose = require('mongoose');
require('dotenv').config();
const MongoDBUrl = process.env.MongooseUrl;

module.exports = {
    name: Events.ClientReady,
    once: false,
    async execute (bot) {
        
        try {

            require('../loader')

            await mongoose.connect(MongoDBUrl || '', {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
                .then(() => {
                    console.log('Database connected!');
                })
                .catch(err => {
                    console.error('Database connection error:', err);
                });
            
            setInterval(async () => {
                bot.user.setActivity({
                    name: `${process.env.StatusText} • ${bot.guilds.cache.size} Servers • v${process.env.Version}`,
                    type: ActivityType.Playing,
                });
            }, 3000);

        } catch (err) {
            if (err.code === '11000') {
                console.log('This IP is not whitelisted on our database!')
            } else {
                console.log(err)
            }
        }

    }
}
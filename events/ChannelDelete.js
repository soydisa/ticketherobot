const { Events, ActivityType, AuditLogOptionsType } = require('discord.js');
const mongoose = require('mongoose');
const MongoDBUrl = process.env.MongooseUrl;
const ticketTicket = require('../schemas/ticketTicket');
require('dotenv').config();

module.exports = {
    name: Events.ChannelDelete,
    once: false,
    async execute (channel, bot) {
        try {
            await channel.guild.fetchAuditLogs({'type': AuditLogOptionsType.ChannelDelete})
            .then(async logs => logs.entries.find(entry => entry.target.id == channel.id) ) 
            .then(async entry => {
                const author = entry.executor;
                if (author.id !== bot.user.id) {
                    const schemaData = await ticketTicket.findOne({ ChannelID: channel.id });
                    if (schemaData) {
                        await ticketTicket.deleteMany({ ChannelID: channel.id });
                    }
                }
            })
        } catch (err) {
            return console.log(err)
        }
    }
}
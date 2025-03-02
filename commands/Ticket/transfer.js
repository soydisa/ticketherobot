const { SlashCommandBuilder, Events, EmbedBuilder, PermissionsBitField, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ticketGuild = require('../../schemas/ticketGuild');
const ticketTicket = require('../../schemas/ticketTicket');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription("Transfer a ticket to an another user")
    .addUserOption(option => option.setName('user').setDescription('The new claimer of the ticket').setRequired(true))
    .setDMPermission(false),
    async execute(interaction, bot) {
        const user = interaction.options.getUser('user')
        const schemaData = await ticketGuild.findOne({ GuildID: interaction.guild.id });
        const dataEmbed = new EmbedBuilder()
        .setColor("#fc3003")
        .setTitle("<:RedRocket:1167551862283702432> Not Set")
        .setDescription(`This server **hasn't** been set`)
        if (!schemaData) return await interaction.reply({ embeds: [dataEmbed], ephemeral: true })
        const ticketData = await ticketTicket.findOne({ GuildID: interaction.guild.id, ChannelID: interaction.channel.id });
        const notfoundEmbed = new EmbedBuilder()
        .setColor("#fc3003")
        .setTitle("<:RedRocket:1167551862283702432> Not Found")
        .setDescription(`This ticket **hasn't** been found on our database`)
        if (!ticketData) return await interaction.reply({ embeds: [notfoundEmbed], ephemeral: true });
        const notclaimedEmbed = new EmbedBuilder()
        .setColor("#fc3003")
        .setTitle("<:RedRocket:1167551862283702432> Not Claimed")
        .setDescription(`This ticket **hasn't** been claimed`)
        if (!ticketData.Claimed) return await interaction.reply({ embeds: [notclaimedEmbed], ephemeral: true });

        const isClaimer = ticketData.ClaimerID === interaction.user.id;
        if (!isClaimer) {
            const notUserEmbed = new EmbedBuilder()
            .setColor("#fc3003")
            .setTitle("<:RedRocket:1167551862283702432> Forbidden")
            .setDescription(`You don't have **permissions** to transfer this ticket`)
            return await interaction.reply({ embeds: [notUserEmbed], ephemeral: true });
        } else {
            if (ticketData.OpenerID !== interaction.user.id) {
                await interaction.channel.permissionOverwrites.delete(interaction.user.id);
            }
            
            await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });

            ticketData.ClaimerID = user.id;
            await ticketData.save();

            const claimEmbed = new EmbedBuilder()
            .setColor("#03fc90")
            .setTitle("<:GreenRocket:1167551742540533781> Ticket Claimed")
            .setDescription(`This ticket will now be managed by ${user}`)
            
            await interaction.reply({ embeds: [claimEmbed] });
        }
    }
}
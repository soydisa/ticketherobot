const { SlashCommandBuilder, Events, EmbedBuilder, PermissionsBitField, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ticketGuild = require('../../schemas/ticketGuild');
const ticketTicket = require('../../schemas/ticketTicket');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('add')
    .setDescription("Add an user to a ticket")
    .addUserOption(option => option.setName('user').setDescription('The user to add to the ticket').setRequired(true))
    .setDMPermission(false),
    async execute(interaction, bot) {
        const user = interaction.options.getUser('user')
        const member = interaction.options.getMember('user')
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

        const isStaff = schemaData.Staff.some((roleId) => interaction.member.roles.cache.has(roleId));;
        if (!isStaff) {
            const notUserEmbed = new EmbedBuilder()
            .setColor("#fc3003")
            .setTitle("<:RedRocket:1167551862283702432> Forbidden")
            .setDescription(`You don't have **permissions** to add someone to this ticket`)
            return await interaction.reply({ embeds: [notUserEmbed], ephemeral: true });
        } else {

            await interaction.channel.permissionOverwrites.create(user.id, { ViewChannel: true, SendMessages: true });

            const claimEmbed = new EmbedBuilder()
            .setColor("#03fc90")
            .setTitle("<:GreenRocket:1167551742540533781> User Added")
            .setDescription(`${user} has been **added** to this ticket`)
            
            await interaction.reply({ embeds: [claimEmbed] });
        }
    }
}
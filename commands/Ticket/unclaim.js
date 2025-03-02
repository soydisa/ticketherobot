const { SlashCommandBuilder, Events, EmbedBuilder, PermissionsBitField, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder, IntegrationExpireBehavior } = require('discord.js');
const ticketGuild = require('../../schemas/ticketGuild');
const ticketTicket = require('../../schemas/ticketTicket');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('unclaim')
    .setDescription("Unclaim a ticket")
    .setDMPermission(false),
    async execute(interaction, bot) {
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

        const isClaimer = ticketData.ClaimerID == interaction.user.id;
        if (!isClaimer && interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const claimedEmbed = new EmbedBuilder()
            .setColor("#fc3003")
            .setTitle("<:RedRocket:1167551862283702432> Not Claimed")
            .setDescription(`This ticket **hasn't** been claimed`)

            if (!ticketData.Claimed) return await interaction.reply({ embeds: [claimedEmbed], ephemeral: true });

            await interaction.deferReply({});

            if (ticketData.ClaimerID === ticketData.OpenerID) {
                schemaData.Staff.forEach(async roleId => {
                    const role = interaction.guild.roles.cache.find(role => role.id === roleId);
                    if (role) {
                        await interaction.channel.permissionOverwrites.edit(roleId, { ViewChannel: true, SendMessages: true });
                    }
                })
            } else {
                await interaction.channel.permissionOverwrites.delete(ticketData.ClaimerID);
                schemaData.Staff.forEach(async roleId => {
                    const role = interaction.guild.roles.cache.find(role => role.id === roleId);
                    if (role) {
                        await interaction.channel.permissionOverwrites.edit(roleId, { ViewChannel: true, SendMessages: true });
                    }
                })
            }

            ticketData.Claimed = false;
            ticketData.ClaimerID = null;
            await ticketData.save();

            const claimEmbed = new EmbedBuilder()
            .setColor("#fc3003")
            .setTitle("<:RedRocket:1167551862283702432> Ticket Unclaimed")
            .setDescription(`This ticket is now unclaimed`)
            
            await interaction.editReply({ embeds: [claimEmbed] });
        } else if (!isClaimer) {
            const notUserEmbed = new EmbedBuilder()
            .setColor("#fc3003")
            .setTitle("<:RedRocket:1167551862283702432> Forbidden")
            .setDescription(`You don't have **permissions** to unclaim this ticket`)
            return await interaction.reply({ embeds: [notUserEmbed], ephemeral: true })
        } else {
            const claimedEmbed = new EmbedBuilder()
            .setColor("#fc3003")
            .setTitle("<:RedRocket:1167551862283702432> Not Claimed")
            .setDescription(`This ticket **hasn't** been claimed`)

            if (!ticketData.Claimed) return await interaction.reply({ embeds: [claimedEmbed], ephemeral: true });

            await interaction.deferReply({});

            if (ticketData.ClaimerID === ticketData.OpenerID) {
                schemaData.Staff.forEach(async roleId => {
                    const role = interaction.guild.roles.cache.find(role => role.id === roleId);
                    if (role) {
                        await interaction.channel.permissionOverwrites.edit(roleId, { ViewChannel: true, SendMessages: true });
                    }
                })
            } else {
                await interaction.channel.permissionOverwrites.delete(ticketData.ClaimerID);
                schemaData.Staff.forEach(async roleId => {
                    const role = interaction.guild.roles.cache.find(role => role.id === roleId);
                    if (role) {
                        await interaction.channel.permissionOverwrites.edit(roleId, { ViewChannel: true, SendMessages: true });
                    }
                })
            }

            ticketData.Claimed = false;
            ticketData.ClaimerID = null;
            await ticketData.save();

            const claimEmbed = new EmbedBuilder()
            .setColor("#fc3003")
            .setTitle("<:RedRocket:1167551862283702432> Ticket Unclaimed")
            .setDescription(`This ticket is now unclaimed`)
            
            await interaction.editReply({ embeds: [claimEmbed] });
        }
    }
}
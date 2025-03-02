const { SlashCommandBuilder, Events, EmbedBuilder, PermissionsBitField, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ticketGuild = require('../../schemas/ticketGuild');
const ticketTicket = require('../../schemas/ticketTicket');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription("Claim a ticket")
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

        const isStaff = schemaData.Staff.some((roleId) => interaction.member.roles.cache.has(roleId));
        if (!isStaff) {
            const notUserEmbed = new EmbedBuilder()
            .setColor("#fc3003")
            .setTitle("<:RedRocket:1167551862283702432> Forbidden")
            .setDescription(`You don't have **permissions** to claim this ticket`)
            return await interaction.reply({ embeds: [notUserEmbed], ephemeral: true })
        } else {
            const claimedEmbed = new EmbedBuilder()
            .setColor("#fc3003")
            .setTitle("<:RedRocket:1167551862283702432> Already Claimed")
            .setDescription(`This ticket **has already** been claimed`)

            if (ticketData.Claimed) return await interaction.reply({ embeds: [claimedEmbed], ephemeral: true });

            await interaction.deferReply({});

            await interaction.channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true, SendMessages: true });

            schemaData.Staff.forEach(async roleId => {
                const role = interaction.guild.roles.cache.find(role => role.id === roleId);
                if (role) {
                    await interaction.channel.permissionOverwrites.edit(roleId, { ViewChannel: true, SendMessages: false });
                }
            })

            ticketData.Claimed = true;
            ticketData.ClaimerID = interaction.user.id;
            await ticketData.save();

            const claimEmbed = new EmbedBuilder()
            .setColor("#03fc90")
            .setTitle("<:GreenRocket:1167551742540533781> Ticket Claimed")
            .setDescription(`This ticket will now be managed by ${interaction.user}`)
            
            await interaction.editReply({ embeds: [claimEmbed] });
        }
    }
}
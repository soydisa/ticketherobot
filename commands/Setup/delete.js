const { SlashCommandBuilder, EmbedBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const ticketGuild = require('../../schemas/ticketGuild');
const ticketTicket = require('../../schemas/ticketTicket');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription("Delete TicketHero from your server")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction, bot) {
        const schemaData = await ticketGuild.findOne({ GuildID: interaction.guild.id })
        const dataEmbed = new EmbedBuilder()
        .setColor("#fc3003")
        .setTitle("<:RedRocket:1167551862283702432> Not Set")
        .setDescription(`This server **hasn't** been set`)
        if (!schemaData) return await interaction.reply({ embeds: [dataEmbed], ephemeral: true })

        /**/

        const successEmbed = new EmbedBuilder()
        .setColor("#03fc90")
        .setTitle("<:GreenRocket:1167551742540533781> Delete Completed")
        .setDescription(`This server has been **deleted**`)

        /**/

        await ticketGuild.deleteMany({ GuildID: interaction.guild.id });
        await ticketTicket.deleteMany({ GuildID: interaction.guild.id });
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });

    }
} 
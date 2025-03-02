const { SlashCommandBuilder, EmbedBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const ticketGuild = require('../../schemas/ticketGuild')
require('dotenv').config();
let PanelChannel;
let TranscriptChannel;
let Category;
let Staff = [];
let Transcript;
let Claiming;
let UserClose
let Mention;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription("Setup TicketHero on your server")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction, bot) {
        const schemaData = await ticketGuild.findOne({ GuildID: interaction.guild.id })
        const dataEmbed = new EmbedBuilder()
        .setColor("#fc3003")
        .setTitle("<:RedRocket:1167551862283702432> Already Set")
        .setDescription(`This server has **already** been set`)
        if (schemaData) return await interaction.reply({ embeds: [dataEmbed], ephemeral: true })

        /**/


        const successEmbed = new EmbedBuilder()
        .setColor("#03fc90")
        .setTitle("<:GreenRocket:1167551742540533781> Setup Completed")
        .setDescription(`This server has been **set**`)
        const expireEmbed = new EmbedBuilder()
        .setColor("#fc3003")
        .setTitle("<:RedRocket:1167551862283702432> Expired")
        .setDescription(`This embed has **expired**`)
        const panelChannelEmbed = new EmbedBuilder()
        .setColor("#fcc203")
        .setTitle("<:OrangeRocket:1167548845731893398> Panel Channel")
        .setDescription(`Select the **panel** channel`)
        const transcriptChannelEmbed = new EmbedBuilder()
        .setColor("#fcc203")
        .setTitle("<:OrangeRocket:1167548845731893398> Transcript Channel")
        .setDescription(`Select the **transcript** channel`)
        const categoryEmbed = new EmbedBuilder()
        .setColor("#fcc203")
        .setTitle("<:OrangeRocket:1167548845731893398> Category")
        .setDescription(`Select the **category**`)
        const staffEmbed = new EmbedBuilder()
        .setColor("#fcc203")
        .setTitle("<:OrangeRocket:1167548845731893398> Staff Roles")
        .setDescription(`Select the **staff** roles`)
        const transcriptEmbed = new EmbedBuilder()
        .setColor("#fcc203")
        .setTitle("<:OrangeRocket:1167548845731893398> Transcript")
        .setDescription(`Do you want to enable the **transcript** function?`)
        const claimingEmbed = new EmbedBuilder()
        .setColor("#fcc203")
        .setTitle("<:OrangeRocket:1167548845731893398> Claiming")
        .setDescription(`Do you want to enable the **claiming** function?`)
        const closeEmbed = new EmbedBuilder()
        .setColor("#fcc203")
        .setTitle("<:OrangeRocket:1167548845731893398> User Can Close")
        .setDescription(`Do you want to enable the **user can close** function?`)
        const mentionEmbed = new EmbedBuilder()
        .setColor("#fcc203")
        .setTitle("<:OrangeRocket:1167548845731893398> Mention")
        .setDescription(`Do you want to enable the **mention** function?`)

        /**/

        const panelChannelSelect = new ChannelSelectMenuBuilder()
        .setCustomId('setup_panelchannel_select')
        .setPlaceholder('Panel Channel')
        .setMinValues(1)
        .setMaxValues(1)
        .addChannelTypes(ChannelType.GuildText)
        const panelChannelRow = new ActionRowBuilder()
        .addComponents(panelChannelSelect)
        const transcriptChannelSelect = new ChannelSelectMenuBuilder()
        .setCustomId('setup_transcriptchannel_select')
        .setPlaceholder('Transcript Channel')
        .setMinValues(1)
        .setMaxValues(1)
        .addChannelTypes(ChannelType.GuildText)
        const transcriptChannelRow = new ActionRowBuilder()
        .addComponents(transcriptChannelSelect)
        const categorySelect = new ChannelSelectMenuBuilder()
        .setCustomId('setup_category_select')
        .setPlaceholder('Category')
        .setMinValues(1)
        .setMaxValues(1)
        .addChannelTypes(ChannelType.GuildCategory)
        const categoryRow = new ActionRowBuilder()
        .addComponents(categorySelect)
        const staffSelect = new RoleSelectMenuBuilder()
        .setCustomId('setup_staff_select')
        .setPlaceholder('Staff Roles')
        .setMinValues(1)
        .setMaxValues(25)
        const staffRow = new ActionRowBuilder()
        .addComponents(staffSelect)
        const transcriptSelect = new StringSelectMenuBuilder()
        .setCustomId('setup_transcript_select')
        .setPlaceholder('Transcript Function')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Yes')
                .setValue('true'),
            new StringSelectMenuOptionBuilder()
                .setLabel('No')
                .setValue('false')
        )
        const transcriptRow = new ActionRowBuilder()
        .addComponents(transcriptSelect)
        const claimingSelect = new StringSelectMenuBuilder()
        .setCustomId('setup_claiming_select')
        .setPlaceholder('Claiming Function')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Yes')
                .setValue('true'),
            new StringSelectMenuOptionBuilder()
                .setLabel('No')
                .setValue('false')
        )
        const claimingRow = new ActionRowBuilder()
        .addComponents(claimingSelect)
        const closeSelect = new StringSelectMenuBuilder()
        .setCustomId('setup_close_select')
        .setPlaceholder('User Can Close Function')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Yes')
                .setValue('true'),
            new StringSelectMenuOptionBuilder()
                .setLabel('No')
                .setValue('false')
        )
        const closeRow = new ActionRowBuilder()
        .addComponents(closeSelect)
        const mentionSelect = new StringSelectMenuBuilder()
        .setCustomId('setup_mention_select')
        .setPlaceholder('Mention Function')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('Yes')
                .setValue('true'),
            new StringSelectMenuOptionBuilder()
                .setLabel('No')
                .setValue('false')
        )
        const mentionRow = new ActionRowBuilder()
        .addComponents(mentionSelect)

        /**/

        const msg = await interaction.reply({ embeds: [panelChannelEmbed], components: [panelChannelRow], ephemeral: true });

        const collector = msg.createMessageComponentCollector({ time: 180000, filter: i => i.user.id === interaction.user.id });
        collector.on('collect', async i => {
            if (i.customId === 'setup_panelchannel_select') {
                const channel = i.values[0];
                PanelChannel = channel;
                await i.update({ embeds: [transcriptChannelEmbed], components: [transcriptChannelRow] });
            } else if (i.customId === 'setup_transcriptchannel_select') {
                const channel = i.values[0];
                TranscriptChannel = channel;
                await i.update({ embeds: [categoryEmbed], components: [categoryRow] });
            } else if (i.customId === 'setup_category_select') {
                const category = i.values[0];
                Category = category;
                await i.update({ embeds: [staffEmbed], components: [staffRow] });
            } else if (i.customId === 'setup_staff_select') {
                const roles = i.values;
                roles.forEach(async role => {
                    Staff.push(role)
                })
                await i.update({ embeds: [transcriptEmbed], components: [transcriptRow] });
            } else if (i.customId === 'setup_transcript_select') {
                const value = i.values[0];
                Transcript = value;
                await i.update({ embeds: [claimingEmbed], components: [claimingRow] });
            } else if (i.customId === 'setup_claiming_select') {
                const value = i.values[0];
                Claiming = value;
                await i.update({ embeds: [closeEmbed], components: [closeRow] });
            } else if (i.customId === 'setup_close_select') {
                const value = i.values[0];
                UserClose = value;
                await i.update({ embeds: [mentionEmbed], components: [mentionRow] });
            } else if (i.customId === 'setup_mention_select') {
                const value = i.values[0];
                Mention = value;
                await ticketGuild.create({ GuildID: interaction.guild.id, PanelChannelID: PanelChannel, TranscriptChannelID: TranscriptChannel, CategoryID: Category, Staff: Staff, Transcript: Transcript, Claiming: Claiming, UserClose: UserClose, Mention: Mention, TicketCount: 0 });
                await i.update({ embeds: [successEmbed], components: [] });
            }
        })
        collector.on('end', async i => {
            await interaction.editReply({ embeds: [expireEmbed], components: [] })
            collector.stop();
        })
    }
} 
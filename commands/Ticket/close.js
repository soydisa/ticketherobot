const { SlashCommandBuilder, Events, EmbedBuilder, PermissionsBitField, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const ticketGuild = require('../../schemas/ticketGuild');
const ticketTicket = require('../../schemas/ticketTicket');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('close')
    .setDescription("Close a ticket")
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

        if (schemaData.UserClose) {
            const closingEmbed = new EmbedBuilder()
            .setColor("#fcc203")
            .setTitle("<:OrangeRocket:1167548845731893398> Closing")
            .setDescription(`Closing ticket in 	\`5 seconds\`...`)
            await ticketTicket.deleteMany({ GuildID: interaction.guild.id, ChannelID: interaction.channel.id });
            await interaction.reply({ embeds: [closingEmbed] })
            setTimeout(async () => {
                const channel = interaction.channel;
                const sendChannel = bot.channels.cache.get(process.env.TranscriptStorage);
                const attachmentBuffer = await discordTranscripts.createTranscript(channel);
                const storageMsg = await sendChannel.send({ files: [attachmentBuffer] });
        
                const formattedLink = `https://mahto.id/chat-exporter?url=${storageMsg.attachments.first().url}`

                let Claimer;

                if (!ticketData.ClaimerID) {
                    Claimer = "Not claimed";
                } else {
                    Claimer = "<@" + ticketData.ClaimerID + ">";
                }

                const transcriptEmbed = new EmbedBuilder()
                .setColor("#2b2d31")
                .setTitle("<:OrangeRocket:1167548845731893398> Ticket Closed")
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                .addFields({ name: 'Ticket ID', value: `${ticketData.TicketID}`, inline: true })
                .addFields({ name: 'Opened By', value: `<@${ticketData.OpenerID}>`, inline: true }, { name: 'Closed By', value: `${interaction.user}`, inline: true }, { name: 'Claimed By', value: `${Claimer}`, inline: true })

                const transcriptButton = new ButtonBuilder()
                .setLabel('Online Transcript')
                .setEmoji('<:TransparentPin:1167842343177687161>')
                .setStyle(ButtonStyle.Link)
                .setURL(formattedLink)

                const transcriptRow = new ActionRowBuilder()
                .addComponents(transcriptButton)

                try {
                    const opener = await bot.users.fetch(ticketData.OpenerID)
                    await opener.send({ embeds: [transcriptEmbed], components: [transcriptRow] })
                } catch (err) {
                    return;
                }
                
                if (schemaData.Transcript) {
                    try {
                        const channel = await bot.channels.cache.get(schemaData.TranscriptChannelID)
                        if (channel) {
                            await channel.send({ embeds: [transcriptEmbed], components: [transcriptRow] })
                        }
                    } catch (err) {
                        return;
                    }
                }

                await interaction.channel.delete();
            }, 5000)
        } else {
            const isStaff = schemaData.Staff.some((roleId) => interaction.member.roles.cache.has(roleId));
            if (!isStaff) {
                const notUserEmbed = new EmbedBuilder()
                .setColor("#fc3003")
                .setTitle("<:RedRocket:1167551862283702432> Forbidden")
                .setDescription(`You don't have **permissions** to close this ticket`)
                return await interaction.reply({ embeds: [notUserEmbed], ephemeral: true })
            } else {
                const closingEmbed = new EmbedBuilder()
                .setColor("#fcc203")
                .setTitle("<:OrangeRocket:1167548845731893398> Closing")
                .setDescription(`Closing ticket in 	\`5 seconds\`...`)
                await ticketTicket.deleteMany({ GuildID: interaction.guild.id, ChannelID: interaction.channel.id });
                await interaction.reply({ embeds: [closingEmbed] })
                setTimeout(async () => {
                    const channel = interaction.channel;
                    const sendChannel = bot.channels.cache.get(process.env.TranscriptStorage);
                    const attachmentBuffer = await discordTranscripts.createTranscript(channel);
                    const storageMsg = await sendChannel.send({ files: [attachmentBuffer] });
            
                    const formattedLink = `https://mahto.id/chat-exporter?url=${storageMsg.attachments.first().url}`

                    let Claimer;

                    if (!ticketData.ClaimerID) {
                        Claimer = "Not claimed";
                    } else {
                        Claimer = "<@" + ticketData.ClaimerID + ">";
                    }

                    const transcriptEmbed = new EmbedBuilder()
                    .setColor("#2b2d31")
                    .setTitle("<:OrangeRocket:1167548845731893398> Ticket Closed")
                    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                    .addFields({ name: 'Ticket ID', value: `${ticketData.TicketID}`, inline: true })
                    .addFields({ name: 'Opened By', value: `<@${ticketData.OpenerID}>`, inline: true }, { name: 'Closed By', value: `${interaction.user}`, inline: true }, { name: 'Claimed By', value: `${Claimer}`, inline: true })

                    const transcriptButton = new ButtonBuilder()
                    .setLabel('Online Transcript')
                    .setEmoji('<:TransparentPin:1167842343177687161>')
                    .setStyle(ButtonStyle.Link)
                    .setURL(formattedLink)

                    const transcriptRow = new ActionRowBuilder()
                    .addComponents(transcriptButton)

                    try {
                        const opener = await bot.users.fetch(ticketData.OpenerID)
                        await opener.send({ embeds: [transcriptEmbed], components: [transcriptRow] })
                    } catch (err) {
                        return;
                    }
                    
                    if (schemaData.Transcript) {
                        try {
                            const channel = await bot.channels.cache.get(schemaData.TranscriptChannelID)
                            if (channel) {
                                await channel.send({ embeds: [transcriptEmbed], components: [transcriptRow] })
                            }
                        } catch (err) {
                            return;
                        }
                    }

                    await interaction.channel.delete();
                }, 5000)
            }
        }
    }
}
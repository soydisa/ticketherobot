const { Events, EmbedBuilder, PermissionsBitField, Embed, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const ticketGuild = require('../schemas/ticketGuild');
const ticketTicket = require('../schemas/ticketTicket');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute (interaction, bot) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`Command ${interaction.commandName} not found`);
                return;
            }
            try {
                await command.execute(interaction, bot);
            } catch (err) {
                if (interaction.replied || interaction.deferred) {
                    console.log(err)
                    const errorEmbed1 = new EmbedBuilder()
                    .setTitle(`<:OrangeCross:1167761544201916496> Error`)
                    .setColor("#2b2d31")
                    .setDescription(`An error occured while performing this command`)
                    .addFields({ name: `Error:`, value: `\`\`\`${err}\`\`\`` })
                    return await interaction.followUp({ embeds: [errorEmbed1], ephemeral: true });
                } else {
                    console.log(err)
                    const errorEmbed2 = new EmbedBuilder()
                    .setTitle(`<:OrangeCross:1167761544201916496> Error`)
                    .setColor("#2b2d31")
                    .setDescription(`An error occured while performing this command`)
                    .addFields({ name: `Error:`, value: `\`\`\`${err}\`\`\`` })
                    return await interaction.reply({ embeds: [errorEmbed2], ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {
            try {
                const schemaData = await ticketGuild.findOne({ GuildID: interaction.guild.id });
                if (interaction.customId === 'panel_button') {
                    const ticketData = await ticketTicket.findOne({ GuildID: interaction.guild.id, OpenerID: interaction.user.id });
    
                    const dataEmbed = new EmbedBuilder()
                    .setColor("#fc3003")
                    .setTitle("<:RedRocket:1167551862283702432> Not Set")
                    .setDescription(`This server **hasn't** been set`)
                    if (!schemaData) return await interaction.reply({ embeds: [dataEmbed], ephemeral: true })
    
                    if (schemaData.PanelChannelID === interaction.channel.id) {
                        if (ticketData) {
                            const openedEmbed = new EmbedBuilder()
                            .setColor("#fc3003")
                            .setTitle("<:RedRocket:1167551862283702432> Already Open")
                            .setDescription(`You **already have** a ticket opened: <#${ticketData.ChannelID}>`)
                            return await interaction.reply({ embeds: [openedEmbed], ephemeral: true })
                        }
        
                        /**/
    
                        const ticketEmbed = new EmbedBuilder()
                        .setColor("#2b2d31")
                        .setTitle(`Ticket ${schemaData.TicketCount + 1}`)
                        .setDescription(`Thanks for opening **a ticket**!\nPlease wait for the staff team`)
    
                        const closeButton = new ButtonBuilder()
                        .setCustomId('close_button')
                        .setLabel('Close')
                        .setEmoji('<:TransparentCancel:1167842207068328017>')
                        .setStyle(ButtonStyle.Danger)
    
                        const claimButton = new ButtonBuilder()
                        .setCustomId('claim_button')
                        .setLabel('Claim')
                        .setEmoji('<:TransparentCrown:1167841817031618590>')
                        .setStyle(ButtonStyle.Success)
    
                        const closeRow = new ActionRowBuilder()
                        .addComponents(closeButton)
                        
                        const claimRow = new ActionRowBuilder()
                        .addComponents(closeButton, claimButton)
    
                        /**/

                        await interaction.deferReply({ ephemeral: true })
        
                        const editedValues = schemaData.Staff.map(function(value) {
                            return "<@&" + value + ">";
                        });
        
                        const mentions = editedValues.join(" ");
        
                        const channel = await interaction.guild.channels.create({
                            name: `ticket-${schemaData.TicketCount + 1}`,
                            parent: schemaData.CategoryID,
                            permissionOverwrites: [
                                {
                                    id: interaction.user.id,
                                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                                },
                                {
                                    id: interaction.guild.id,
                                    deny: [PermissionsBitField.Flags.ViewChannel]
                                },
                            ]
                        });
        
                        schemaData.Staff.forEach(async roleId => {
                            const role = interaction.guild.roles.cache.find(role => role.id === roleId);
                            if (role) {
                                await channel.permissionOverwrites.edit(roleId, { ViewChannel: true, SendMessages: true });
                            }
                        })
        
                        await ticketTicket.create({ GuildID: interaction.guild.id, ChannelID: channel.id, TicketID: schemaData.TicketCount + 1, OpenerID: interaction.user.id, Claimed: false })
        
                        schemaData.TicketCount++;
                        await schemaData.save();
    
                        if (schemaData.Mention) {
                            const msg = await channel.send({ content: `${mentions} ${interaction.user}` })
        
                            await msg.delete();
                        }
    
                        if (schemaData.Claiming) {
                            await channel.send({ embeds: [ticketEmbed], components: [claimRow] })
                        } else {
                            await channel.send({ embeds: [ticketEmbed], components: [closeRow] })
                        }

                        const openEmbed = new EmbedBuilder()
                        .setColor("#03fc90")
                        .setTitle("<:GreenRocket:1167551742540533781> Ticket Created")
                        .setDescription(`Your ticket has been created: ${channel}`)
        
                        await interaction.editReply({ embeds: [openEmbed] });
                    }
                } else if (interaction.customId === 'close_button') {
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
                } else if (interaction.customId === 'claim_button') {
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
            } catch (err) {
                if (interaction.replied || interaction.deferred) {
                    console.log(err)
                    const errorEmbed1 = new EmbedBuilder()
                    .setTitle(`<:OrangeCross:1167761544201916496> Error`)
                    .setColor("#2b2d31")
                    .setDescription(`An error occured while performing this command`)
                    .addFields({ name: `Error:`, value: `\`\`\`${err}\`\`\`` })
                    return await interaction.followUp({ embeds: [errorEmbed1], ephemeral: true });
                } else {
                    console.log(err)
                    const errorEmbed2 = new EmbedBuilder()
                    .setTitle(`<:OrangeCross:1167761544201916496> Error`)
                    .setColor("#2b2d31")
                    .setDescription(`An error occured while performing this command`)
                    .addFields({ name: `Error:`, value: `\`\`\`${err}\`\`\`` })
                    return await interaction.reply({ embeds: [errorEmbed2], ephemeral: true });
                }
            }
        }
    }
}
const { SlashCommandBuilder, EmbedBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelType, ActionRowBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const ticketGuild = require('../../schemas/ticketGuild');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription("Create a ticket panel")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction, bot) {
        const schemaData = await ticketGuild.findOne({ GuildID: interaction.guild.id });
        const dataEmbed = new EmbedBuilder()
        .setColor("#fc3003")
        .setTitle("<:RedRocket:1167551862283702432> Not Set")
        .setDescription(`This server **hasn't** been set`)
        if (!schemaData) return await interaction.reply({ embeds: [dataEmbed], ephemeral: true });

        const modalFields = {
            paneltitle: new TextInputBuilder()
            .setCustomId(`panel_panel_title_modal`)
            .setLabel(`Panel Title`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(15),
            paneldescription: new TextInputBuilder()
            .setCustomId(`panel_panel_description_modal`)
            .setLabel(`Panel Description`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(75),
            thumbnail: new TextInputBuilder()
            .setCustomId(`panel_panel_thumbnail_modal`)
            .setLabel(`Panel Image URL`)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMinLength(1)
            .setMaxLength(200),
            buttontext: new TextInputBuilder()
            .setCustomId(`panel_button_text_modal`)
            .setLabel(`Button Text`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(10),
            buttonemoji: new TextInputBuilder()
            .setCustomId(`panel_button_emoji_modal`)
            .setLabel(`Button Emoji`)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMinLength(1)
            .setMaxLength(40)
        }
          
        const panelModal = new ModalBuilder()
        .setCustomId(`panel_modal`)
        .setTitle(`Create a panel`)
        .addComponents(
            new ActionRowBuilder().addComponents(modalFields.paneltitle),
            new ActionRowBuilder().addComponents(modalFields.paneldescription),
            new ActionRowBuilder().addComponents(modalFields.thumbnail),
            new ActionRowBuilder().addComponents(modalFields.buttontext),
            new ActionRowBuilder().addComponents(modalFields.buttonemoji)
        )
          
        await interaction.showModal(panelModal)
          
        const modalSubmit = await interaction.awaitModalSubmit({
            time: 180000,
            filter: i => i.user.id === interaction.user.id
        }).catch(error => {
            console.error(error)
            return null
        })

        if (modalSubmit) {
            const [ paneltitle, paneldescription, thumbnail, buttontext, buttonemoji ] = Object.keys(modalFields).map(key => modalSubmit.fields.getTextInputValue(modalFields[key].data.custom_id))
            const channel = bot.channels.cache.get(schemaData.PanelChannelID)

            /**/

            const panelEmbed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle(`${paneltitle}`)
            .setDescription(`${paneldescription}`)

            if (thumbnail.length >= 1) {
                panelEmbed.setThumbnail(thumbnail)
            }

            const panelButton = new ButtonBuilder()
            .setCustomId('panel_button')
            .setLabel(`${buttontext}`)
            .setStyle(ButtonStyle.Primary)
            
            if (buttonemoji.length >= 1) {
                panelButton.setEmoji(buttonemoji)
            }

            const panelRow = new ActionRowBuilder()
            .addComponents(panelButton)

            const successEmbed = new EmbedBuilder()
            .setColor("#03fc90")
            .setTitle("<:GreenRocket:1167551742540533781> Panel Sent")
            .setDescription(`The panel has been **sent** in ${channel}`)

            /**/

            await channel.send({ embeds: [panelEmbed], components: [panelRow] });
            await modalSubmit.reply({ embeds: [successEmbed], ephemeral: true });
        }
    }
} 
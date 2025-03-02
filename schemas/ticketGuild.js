const { model, Schema } = require('mongoose');

let ticketGuild = new Schema({
    GuildID: { type: String, required: true, unique: true },
    PanelChannelID: { type: String, required: true },
    TranscriptChannelID: { type: String, required: true },
    CategoryID: { type: String, required: true },
    Staff: [
        { type: String, required: true }
    ],
    Mention: { type: Boolean, required: true },
    Claiming: { type: Boolean, required: true },
    UserClose: { type: Boolean, required: true },
    Transcript: { type: Boolean, required: true },
    TicketCount: { type: Number, required: true }
})

module.exports = model("ticketGuild", ticketGuild);
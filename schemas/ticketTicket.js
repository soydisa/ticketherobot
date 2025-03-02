const { model, Schema } = require('mongoose');

let ticketTicket = new Schema({
    GuildID: { type: String, required: true },
    ChannelID: { type: String, required: true, unique: true },
    TicketID: { type: String, required: true },
    OpenerID: { type: String, required: true },
    ClaimerID: { type: String, required: false },
    Claimed: { type: Boolean, required: true }
})

module.exports = model("ticketTicket", ticketTicket);
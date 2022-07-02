const mongoose = require("mongoose");
let ElectionSchema = new mongoose.Schema({
    voters: {
        type: [String]
    }
})

let Election = mongoose.model("election",ElectionSchema);
module.exports = Election;
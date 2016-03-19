var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ScoreSchema = new mongoose.Schema({
  platform: {
    type: Schema.Types.ObjectId, 
    ref: 'Platform'
  },
  score: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Score', ScoreSchema);

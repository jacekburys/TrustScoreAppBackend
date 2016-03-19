var mongoose = require('mongoose');

var PlatformSchema = new mongoose.Schema({
  name: String,
  scores: [{
    type: Schema.Types.ObjectId,
    ref: 'Score'
  }]
});

module.exports = mongoose.model('Platform', PlatformSchema);

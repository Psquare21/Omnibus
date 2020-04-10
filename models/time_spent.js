var mongoose = require('mongoose')

var TimeSpentSchema = new mongoose.Schema({
	time: { type: String, required: true },
	article_id: {
		ref: 'Articles',
		type: mongoose.Schema.ObjectId,
		required: true
	},
	user_id: { ref: 'User', type: mongoose.Schema.ObjectId, required: true },
	created_on: { type: String }
});

module.exports = mongoose.model('TimeSpent', TimeSpentSchema);
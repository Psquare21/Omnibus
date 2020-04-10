var mongoose = require('mongoose');

var articleSchema = mongoose.Schema({
	text: String,
	article: {
		id: {
			type: String,
			unique: true,
			required: true
		},
		name: {
			type: String,
			unique: false,
			required: false
		},
		text: {
			type: String,
			unique: false,
			required: false
		}
	},
	created_by: {
		ref: 'User',
		type: mongoose.Schema.ObjectId,
		required: true
	},
	created_on: {
		type: Date,
		default:Date.now
	},
	reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Article', articleSchema);
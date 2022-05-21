require('dotenv').config();

const loglevel = {
	jwtSecretKey: process.env.JWT_SECRET,

	logger: require('tracer').console({
		format: ['{{timestamp}} [{{title}}] {{file}}:{{line}} : {{message}}'],
		preprocess: function (data) {
			data.title = data.title.toUpperCase();
		},
		dateformat: 'isoUtcDateTime',
		level: process.env.LOGLEVEL,
	}),
};

module.exports = loglevel;

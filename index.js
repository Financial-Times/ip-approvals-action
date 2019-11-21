require('dotenv').config()
const axios = require('axios')
const { google } = require('googleapis');

const authorize = (credentials) => {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
	oAuth2Client.setCredentials({
		access_token: process.env.GOOGLE_ACCESS_TOKEN,
		refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
		scope: 'https://www.googleapis.com/auth/spreadsheets',
		token_type: 'Bearer',
		expiry_date: process.env.GOOGLE_EXPIRY_DATE
	});
	return oAuth2Client;
};

async function getRowFromUuid(uuid, response) {
	const oAuth2Client = authorize({
		installed: {
			client_id: process.env.GOOGLE_CLIENT_ID,
			project_id: process.env.GOOGLE_PROJECT_ID,
			auth_uri: 'https://accounts.google.com/o/oauth2/auth',
			token_uri: 'https://oauth2.googleapis.com/token',
			auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
			client_secret: process.env.GOOGLE_CLIENT_SECRET,
			redirect_uris: ["https://lursqeu722.execute-api.eu-west-1.amazonaws.com/prod/"]
		}
	});

	const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

	const ressy = await sheets.spreadsheets.values.get({
		spreadsheetId: '109ptCW0m3OgZaDTe0Y26cYBPbuzmN8pv4CZw8Umpe-I',
		range: 'Form responses 1!A2:J',
	})

	if (ressy.status === 200) {
		if (!ressy.data || !ressy.data.values) {
			throw new Error('No data found in spreadsheet')
		};

		const rows = ressy.data.values
		let rowWeNeed
		rowWeNeed = rows.findIndex((row) => {
			return row[9] === uuid
		})
		const cell = rowWeNeed + 2
		const spreadsheetId = '109ptCW0m3OgZaDTe0Y26cYBPbuzmN8pv4CZw8Umpe-I'
		const range = `Form responses 1!I${cell}`
		let values = [[response]]
		let resource = {
			values
		}

		const ressy2 = await sheets.spreadsheets.values.update({
			spreadsheetId,
			range,
			valueInputOption: 'RAW',
			resource
		})

		if (ressy2.status === 200) {
			if (!ressy2.data || !ressy2.data.values) {
				throw new Error('No data put in spreadsheet')
			};
		}

	}
}

const sendResponse = async (responseUrl, answer, uuid) => {

	let text

	if (answer === 'approve') {
		text = `You've approved request ${uuid} ✅`
	} else if (answer === 'deny') {
		text = `You've denied request ${uuid} ❌`
	}

	const response = await axios.post(
		responseUrl,
		{
			replace_original: "false",
			text,
			headers: {
				'content-type': 'application/json',
				Authorization: `Bearer ${process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN}`,
			},
		}
	)
	return response
}

const authenticate = (httpMethod, token) => {
	if (httpMethod !== 'POST') {
		throw new Error('405')
	}
	const { SLACK_TOKEN } = process.env
	if (!token || token !== SLACK_TOKEN) {
		throw new Error('401')
	}
	console.log('Authentication successful')
}

exports.handler = async function (event, context, callback) {
	try {
		if (event) {

			const decodedMessage = decodeURIComponent(event.body);
			const messageObjectString = decodedMessage.split('payload=')[1]
			const messageObject = JSON.parse(messageObjectString)

			const { token, response_url, actions, message } = messageObject

			authenticate('POST', token)

			const approverResponse = actions[0].value

			const uuid = message.text.split('id:')[1].split('from')[0].replace(/[+]/g, '')

			const slackResponse = await sendResponse(response_url, approverResponse, uuid)

			// update spreadsheet

			const googleApiResponse = await getRowFromUuid(uuid, approverResponse)

			return {
				statusCode: 200,
				body: 'Cheers 🍻',
			}

		} else {
			console.log("No event")
			// Use this to retrigger a slack message to approver 
		}
	} catch (err) {
		console.log(err)
	}

}

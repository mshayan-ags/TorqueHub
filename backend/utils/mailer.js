const { fetchSecretValue } = require("./azureSecrets");

const connectionSecretIdentifier = process.env.ACS_EMAIL_SECRET_IDENTIFIER;
const senderAddress = process.env.ACS_EMAIL_SENDER_ADDRESS;

let emailClientPromise;

// Resolves an Azure Communication Services EmailClient the same
// env-var-or-Key-Vault way every other Azure-backed secret in this app is
// resolved. Returns null (not a throw) when no ACS config is present at
// all, so callers can fall back to a local-dev console log instead of
// failing OTP/email flows outright.
async function getEmailClient() {
	if (emailClientPromise) {
		return emailClientPromise;
	}

	let connectionString = process.env.ACS_EMAIL_CONNECTION_STRING;

	if (!connectionString && !connectionSecretIdentifier) {
		return null;
	}

	emailClientPromise = (async () => {
		if (!connectionString) {
			connectionString = await fetchSecretValue(connectionSecretIdentifier);
		}
		// Required lazily so this dependency is only needed once ACS is
		// actually configured (keeps local dev free of the extra package
		// requirement until someone opts in).
		const { EmailClient } = require("@azure/communication-email");
		return new EmailClient(connectionString);
	})().catch((error) => {
		emailClientPromise = undefined;
		throw error;
	});

	return emailClientPromise;
}

async function sendMail({ to, subject, html, text }) {
	const client = await getEmailClient();

	if (!client) {
		// Local-dev fallback: no ACS config present. Never block the caller —
		// OTP/email flows should degrade gracefully, not fail the request.
		console.log(`[dev-mailer] No ACS_EMAIL config set. Would have sent to ${to}: ${subject}\n${text || html}`);
		return { devFallback: true };
	}

	const poller = await client.beginSend({
		senderAddress,
		content: { subject, html: html || `<p>${text}</p>`, plainText: text || subject },
		recipients: { to: [{ address: to }] }
	});
	return poller.pollUntilDone();
}

async function sendOtpEmail(to, otp) {
	return sendMail({
		to,
		subject: "Your TorqueHub verification code",
		text: `Your verification code is ${otp}. It expires in ${Number(process.env.OTP_EXPIRY_MINUTES) || 10} minutes.`,
		html: `<p>Your verification code is <strong>${otp}</strong>.</p><p>It expires in ${Number(process.env.OTP_EXPIRY_MINUTES) || 10} minutes.</p>`
	});
}

module.exports = { sendMail, sendOtpEmail };

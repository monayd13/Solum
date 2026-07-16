import twilio from "twilio";

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured.");
  }

  return twilio(accountSid, authToken);
}

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

export async function sendSMS(to: string, body: string) {
  if (!TWILIO_PHONE_NUMBER) {
    throw new Error("TWILIO_PHONE_NUMBER is not configured.");
  }
  const client = getTwilioClient();
  return client.messages.create({
    from: TWILIO_PHONE_NUMBER,
    to,
    body,
  });
}

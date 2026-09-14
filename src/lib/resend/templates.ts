import { brand } from "@/lib/config/site";

function wrap(title: string, body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#070809;color:#efe6d4;font-family:Georgia,serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#070809;padding:48px 20px;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="border:1px solid rgba(239,230,212,0.14);padding:36px 32px;">
          <tr><td style="letter-spacing:0.28em;font-size:11px;text-transform:uppercase;color:#b08d4a;font-family:Helvetica,Arial,sans-serif;">${brand.name}</td></tr>
          <tr><td style="padding-top:18px;font-size:28px;line-height:1.2;">${title}</td></tr>
          <tr><td style="padding-top:18px;font-size:16px;line-height:1.7;color:#c9bfa8;">${body}</td></tr>
          <tr><td style="padding-top:28px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#8a6d38;font-family:Helvetica,Arial,sans-serif;">${brand.idea}</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export const emailTemplates = {
  doorsReminder: (when: string) => ({
    subject: `${brand.name}: a reminder for the tenth`,
    html: wrap(
      "The doors open on the tenth.",
      `We will write when the house is open again (${when}). This is a reminder, not a waitlist and not an application.`,
    ),
  }),
  applicationReceived: () => ({
    subject: `${brand.name}: your application is received`,
    html: wrap(
      "Received, and in human hands.",
      "Selection is discretionary. A complete application is considered; it is never guaranteed. No more than ten new members are hand-selected each month.",
    ),
  }),
  approvedPaymentPending: () => ({
    subject: `${brand.name}: you have been invited to continue`,
    html: wrap(
      "An invitation, not an ending.",
      "A steward has approved your application. Membership begins after you complete checkout. Prices are confirmed at that step — never guessed.",
    ),
  }),
  declined: () => ({
    subject: `${brand.name}: a note on your application`,
    html: wrap(
      "Not this month.",
      "This is not a verdict on your work. The house is small on purpose. You may be considered with a later cohort if you wish to remain in correspondence.",
    ),
  }),
  referralGranted: () => ({
    subject: `${brand.name}: a door opens earlier`,
    html: wrap(
      brand.referralTone,
      "Your referral is valid for early Open House entry. What happens next is still earned.",
    ),
  }),
  eventReminder: (title: string) => ({
    subject: `${brand.name}: ${title}`,
    html: wrap(title, "A reminder for a listed gathering. Details remain inside the house."),
  }),
  crossingAccepted: () => ({
    subject: `${brand.name}: Your Crossing request was accepted.`,
    html: wrap(
      "Your Crossing request was accepted.",
      "A private conversation may now open. City-level presence only — this is not real-time location sharing.",
    ),
  }),
  crossingOverlap: (city: string, count: string) => ({
    subject: `${brand.name}: ${count} members will be in ${city} while you are.`,
    html: wrap(
      `${count} members will be in ${city} while you are.`,
      "When your paths cross, you’ll know. SYNTHETIC DEMO copy until live mail is enabled.",
    ),
  }),
};

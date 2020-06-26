const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export function sendMail({ subject, text }: { subject: string; text: string }) {
    sgMail.send({
        to: process.env.NOTIFY_EMAIL!,
        from: process.env.NOTIFY_EMAIL!,
        subject,
        text,
        html: text,
    });
}

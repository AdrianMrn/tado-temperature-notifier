const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export function sendMail({ subject, text, html }: { subject: string; text: string; html: string }) {
    console.log(`Sending mail with subject ${subject} and text ${text} to ${process.env.NOTIFY_EMAIL}`);
    sgMail.send({
        to: process.env.NOTIFY_EMAIL,
        from: { name: 'Tado temp notifier', email: process.env.NOTIFY_EMAIL },
        subject,
        text,
        html,
    });
}

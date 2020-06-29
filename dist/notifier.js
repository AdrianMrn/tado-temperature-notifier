"use strict";
exports.__esModule = true;
exports.sendMail = void 0;
var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
function sendMail(_a) {
    var subject = _a.subject, text = _a.text, html = _a.html;
    console.log("Sending mail with subject " + subject + " and text " + text + " to " + process.env.NOTIFY_EMAIL);
    sgMail.send({
        to: process.env.NOTIFY_EMAIL,
        from: { name: 'Tado temp notifier', email: process.env.NOTIFY_EMAIL },
        subject: subject,
        text: text,
        html: html
    });
}
exports.sendMail = sendMail;

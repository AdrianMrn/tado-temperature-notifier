"use strict";
exports.__esModule = true;
exports.sendMail = void 0;
var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
function sendMail(_a) {
    var subject = _a.subject, text = _a.text;
    sgMail.send({
        to: process.env.NOTIFY_EMAIL,
        from: process.env.NOTIFY_EMAIL,
        subject: subject,
        text: text,
        html: text
    });
}
exports.sendMail = sendMail;

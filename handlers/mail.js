const nodemailer = require('nodemailer');
const config = require('../config');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const transport = nodemailer.createTransport(config.mail);

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  const inlined = juice(html);
  return inlined;
};

exports.send = (options) => {
  const html = generateHTML(options.file, options);
  const text = htmlToText.fromString(html);

  const mailOptions = {
    from: `"Now That's Delicious!" <noreply@delicious.com>`,
    to: options.user.email,
    subject: options.subject,
    html,
    text
  };

  return new Promise((resolve, reject) => {
    transport.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info.response);
      }
    });
  });
};

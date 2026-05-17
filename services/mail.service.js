const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: "kaushalthewebwolves@gmail.com",

    pass: "dpae bnbt ghzx lxna",
  },
});

exports.sendSetupMail = async (email, username, token) => {
  const setupLink = `http://localhost:8100/setup-password/${token}`;

  const info = await transporter.sendMail({
    from: '"School ERP(2)" <kaushalthewebwolves@gmail.com>',

    to: email,

    subject: "Setup Password",

    html: `

      <div style="font-family: Arial; padding:20px;">

        <h2>Welcome To School ERP</h2>

        <p>
          Username:
          <b>${username}</b>
        </p>

        <p>
          Click below button to setup password
        </p>

        <a
          href="${setupLink}"
          style="
            background:#2563eb;
            color:white;
            padding:12px 20px;
            border-radius:8px;
            text-decoration:none;
            display:inline-block;
          ">

          Setup Password

        </a>

      </div>
    `,
  });

  console.log("Mail Sent:", info.messageId);
};

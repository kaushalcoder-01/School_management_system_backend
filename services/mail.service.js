const nodemailer = require("nodemailer");


let testAccount;

async function createTransporter() {

    testAccount =
        await nodemailer.createTestAccount();

    return nodemailer.createTransport({

        host: "smtp.ethereal.email",

        port: 587,

        secure: false,

        auth: {

            user: testAccount.user,

            pass: testAccount.pass
        }
    });
}

exports.sendSetupMail = async (
    email,
    username,
    token
) => {

    const transporter =
        await createTransporter();

    const setupLink =
        `http://localhost:8100/setup-password/${token}`;

    const info =
        await transporter.sendMail({

            from:
                '"School ERP" <noreply@school.com>',

            to: email,

            subject: "Setup Password",

            html: `

                <h2>Welcome To School ERP</h2>

                <p>
                Username:
                <b>${username}</b>
                </p>

                <a href="${setupLink}">
                    Setup Password
                </a>
            `
        });

    console.log(

        "Preview URL:",
        
        nodemailer.getTestMessageUrl(info)
    );
};
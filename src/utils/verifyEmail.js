    const jwt = require("jsonwebtoken");
    const sendGrid = require("@sendgrid/mail");
    sendGrid.setApiKey(process.env.EMAIL_PASS);
    const { PAGE_URL } = require("../config.js");

    const sendVerificationEmail = async (id, email) => {
        // Sign token using JSONWebToken
        const token = jwt.sign(
            { id: id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );
        // Send Email
        const emailVerification = {
            from: '"IlyVerse" <eavalera19@gmail.com>', // sender address
            to: email, // list of recipients
            subject: "Verificación de correo IlyVerse", // subject line
            html: `
                <h2>Bienvenido a IlyVerse!</h2>
                <p>Por favor, haz clic en el enlace de abajo para verificar tu dirección de correo electrónico:</p>
                <a href='${PAGE_URL}/verify/${id}/${token}'>Verificar correo</a>
            `, // HTML body
        };
        try {
            await sendGrid.send(emailVerification);
        } catch (error) {
            console.log("Error crítico al enviar correo de verificación:", error);
            if (error.response) {
                console.log("Error en SendGrid:", JSON.stringify(error.response.body, null, 2));
            }
            throw error;
        }
    };

    module.exports = sendVerificationEmail;
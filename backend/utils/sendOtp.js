const nodemailer = require("nodemailer");


// =====================================
// GMAIL TRANSPORTER
// =====================================

const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

  });


// =====================================
// VERIFY SMTP CONNECTION
// =====================================

transporter.verify((error) => {

  if (error) {

    console.error(
      "Gmail SMTP error:",
      error.message
    );

  } else {

    console.log(
      "Gmail SMTP ready"
    );

  }

});


// =====================================
// SEND EMAIL VERIFICATION OTP
// =====================================

const sendOtpEmail = async (
  email,
  otp
) => {

  const mailOptions = {

    from:
      `"Your App" <${process.env.EMAIL_USER}>`,

    to: email,

    subject:
      "Verify your email address",

    html: `

      <!DOCTYPE html>

      <html>

      <body
        style="
          margin:0;
          padding:0;
          background:#f4f4f5;
          font-family:Arial,sans-serif;
        "
      >

        <div
          style="
            max-width:500px;
            margin:40px auto;
            background:#ffffff;
            padding:35px;
            border-radius:12px;
          "
        >

          <h2>
            Verify your email
          </h2>

          <p>
            Hello,
          </p>

          <p>
            Thank you for creating an account.
            Use the OTP below to verify your
            email address.
          </p>

          <div
            style="
              background:#f3f4f6;
              padding:20px;
              margin:25px 0;
              text-align:center;
              border-radius:8px;
            "
          >

            <span
              style="
                font-size:32px;
                font-weight:bold;
                letter-spacing:8px;
              "
            >
              ${otp}
            </span>

          </div>

          <p>
            This OTP expires in
            <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not create this account,
            you can safely ignore this email.
          </p>

        </div>

      </body>

      </html>

    `,
  };


  try {

    const result =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "Verification email sent:",
      result.messageId
    );

    return result;

  } catch (error) {

    console.error(
      "Verification email error:",
      error
    );

    throw new Error(
      "Failed to send OTP email"
    );
  }
};


// =====================================
// SEND PASSWORD RESET OTP
// =====================================

const sendPasswordResetOtpEmail =
  async (
    email,
    otp
  ) => {

    const mailOptions = {

      from:
        `"Your App" <${process.env.EMAIL_USER}>`,

      to: email,

      subject:
        "Password Reset OTP",

      html: `

        <!DOCTYPE html>

        <html>

        <body
          style="
            margin:0;
            padding:0;
            background:#f4f4f5;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              max-width:500px;
              margin:40px auto;
              background:#ffffff;
              padding:35px;
              border-radius:12px;
            "
          >

            <h2>
              Reset your password
            </h2>

            <p>
              We received a request to reset
              your password.
            </p>

            <p>
              Use this OTP:
            </p>

            <div
              style="
                background:#f3f4f6;
                padding:20px;
                margin:25px 0;
                text-align:center;
                border-radius:8px;
              "
            >

              <span
                style="
                  font-size:32px;
                  font-weight:bold;
                  letter-spacing:8px;
                "
              >
                ${otp}
              </span>

            </div>

            <p>
              This OTP expires in
              <strong>10 minutes</strong>.
            </p>

            <p>
              If you did not request a password
              reset, you can safely ignore this
              email.
            </p>

          </div>

        </body>

        </html>

      `,
    };


    try {

      const result =
        await transporter.sendMail(
          mailOptions
        );

      console.log(
        "Password reset email sent:",
        result.messageId
      );

      return result;

    } catch (error) {

      console.error(
        "Password reset email error:",
        error
      );

      throw new Error(
        "Failed to send password reset OTP"
      );
    }
  };


module.exports = {
  sendOtpEmail,
  sendPasswordResetOtpEmail,
};
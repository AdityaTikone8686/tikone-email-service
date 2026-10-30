import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Allow POST requests only
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    // Check API key
    const apiKey = req.headers["x-email-api-key"];

    if (
      !process.env.EMAIL_SERVICE_API_KEY ||
      apiKey !== process.env.EMAIL_SERVICE_API_KEY
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // Check required email fields
    const { to, subject, text } = req.body || {};

    if (!to || !subject || !text) {
      return res.status(400).json({
        success: false,
        message: "to, subject and text are required"
      });
    }

    // Check Gmail credentials
    const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: "Gmail credentials are not configured"
      });
    }

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000
    });

    // Send email and wait for completion
    const info = await transporter.sendMail({
      from: `"Tikone Cricket Gurukul" <${GMAIL_USER}>`,
      to,
      subject,
      text
    });

    await transporter.close();

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId
    });

  } catch (error) {
    console.error("Email sending error:", error);

    return res.status(500).json({
      success: false,
      message: "Email could not be sent"
    });
  }
}

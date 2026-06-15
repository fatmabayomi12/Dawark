export const resetPasswordTemplate = (email, resetCode) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Password Reset Request</h2>

      <p>Hello <b>${email || "User"}</b>,</p>

      <p>We received a request to reset your password.</p>

      <p>Your verification code is:</p>

      <h1 style="color:#2c3e50;">${resetCode}</h1>

      <p>This code will expire in <b>10 minutes</b>.</p>

      <p>If you did not request this, ignore this email.</p>

      <br/>
      <p>Thanks,<br/>Dawark Team</p>
    </div>
  `;
};
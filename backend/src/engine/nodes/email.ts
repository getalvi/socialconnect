import nodemailer from "nodemailer";
import { registerNode } from "../nodeRegistry";

function interpolate(template: string, input: any): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path) => {
    const v = path.split(".").reduce((acc: any, key: string) => acc?.[key], input);
    return v === undefined ? "" : String(v);
  });
}

registerNode({
  type: "email",
  label: "Send Email",
  category: "action",
  outputs: ["main"],
  paramsSchema: {
    credentialId: { type: "credential", label: "SMTP Credential", required: true },
    to: { type: "string", label: "To", required: true },
    subject: { type: "string", label: "Subject (supports {{path}})", required: true },
    body: { type: "text", label: "Body (supports {{path}})", required: true },
  },
  async execute(params, input, ctx) {
    const creds = await ctx.getCredential(params.credentialId);
    const transporter = nodemailer.createTransport({
      host: creds.host,
      port: creds.port,
      secure: creds.secure ?? true,
      auth: { user: creds.user, pass: creds.pass },
    });

    const info = await transporter.sendMail({
      from: creds.from || creds.user,
      to: interpolate(params.to, input),
      subject: interpolate(params.subject, input),
      text: interpolate(params.body, input),
    });

    return { main: { messageId: info.messageId } };
  },
});

import { Resend } from "resend";

let resend: Resend;

// Construct on first use, not on import. The Resend constructor throws when
// the key is missing, which would take down every route that imports it.
export const getResendClient = () => {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }

    resend = new Resend(apiKey);
  }

  return resend;
};

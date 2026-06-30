import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, company, inquiry, message } = data;

    if (!name || !email || !inquiry || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // We will use your existing Brevo API key from the .env file!
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = 'support@insydz.com'; // WARNING: Must be verified in Brevo!

    if (!apiKey) {
      console.error("Missing BREVO_API_KEY in environment variables.");
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Format the email using Brevo's API format
    const brevoPayload = {
      sender: {
        name: "Insydz Contact Form",
        email: senderEmail
      },
      to: [
        {
          email: "support@insydz.com", // It will go directly here!
          name: "Insydz Support"
        }
      ],
      replyTo: {
        email: email,
        name: name
      },
      subject: `New Inquiry: ${inquiry} from ${name}`,
      textContent: `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nInquiry Type: ${inquiry}\n\nMessage:\n${message}`
    };

    // Send the email using Brevo REST API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(brevoPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo Error:', errorData);
      throw new Error('Failed to send email via Brevo');
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

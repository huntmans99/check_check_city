import { NextRequest, NextResponse } from 'next/server';
import { otpStore, generateOtp } from '../otp-store';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const vonageApiKey = process.env.VONAGE_API_KEY;
    const vonageApiSecret = process.env.VONAGE_API_SECRET;
    const vonageSenderId = process.env.VONAGE_SENDER_ID || 'CheckCity';

    if (!vonageApiKey || !vonageApiSecret) {
      return NextResponse.json(
        { error: 'Vonage credentials not configured' },
        { status: 500 }
      );
    }

    // Generate 6-digit OTP
    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(phone, { code: otp, expiresAt });

    // Format phone number for Vonage (ensure it has country code)
    const cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digits
    // If it starts with 0, replace with 233 (Ghana country code)
    const formattedPhone = cleanPhone.startsWith('0') 
      ? '233' + cleanPhone.substring(1)
      : cleanPhone;

    try {
      // Use Vonage REST API directly (matching curl format)
      const params = new URLSearchParams({
        from: vonageSenderId,
        to: formattedPhone,
        text: `Your Check Check City password reset code is: ${otp}. This code expires in 10 minutes.`,
        api_key: vonageApiKey,
        api_secret: vonageApiSecret,
      });

      const response = await fetch('https://rest.nexmo.com/sms/json', {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.json();

      if (data.messages && data.messages[0].status === '0') {
        return NextResponse.json(
          { success: true, message: 'OTP sent via SMS' },
          { status: 200 }
        );
      } else {
        const errorMsg = data.messages?.[0]?.['error-text'] || data.error_text || 'Unknown error';
        throw new Error(`Vonage error: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('Vonage SMS Error:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { otpStore, verifiedOtps, isOtpExpired } from '../otp-store';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, newPassword } = await request.json();

    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Phone, OTP, and new password required' },
        { status: 400 }
      );
    }

    // Verify OTP is valid
    const storedOtp = otpStore.get(phone);
    if (!storedOtp || isOtpExpired(storedOtp.expiresAt)) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    if (storedOtp.code !== otp) {
      return NextResponse.json(
        { error: 'Incorrect OTP' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in Supabase
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('phone', phone);

    if (error) {
      console.error('Error updating password:', error);
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    // Clear used OTP
    otpStore.delete(phone);
    verifiedOtps.delete(phone);

    return NextResponse.json(
      { success: true, message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}

// Mark OTP as verified (separate endpoint for security)
export async function PUT(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone and OTP required' },
        { status: 400 }
      );
    }

    // Verify OTP exists and is valid
    const storedOtp = otpStore.get(phone);
    if (!storedOtp || isOtpExpired(storedOtp.expiresAt) || storedOtp.code !== otp) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Mark as verified
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes to reset password
    verifiedOtps.set(phone, { expiresAt });

    return NextResponse.json(
      { success: true, message: 'OTP verified' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in OTP verification:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}

# WhatsApp OTP Password Reset Implementation

## Overview
This document describes the WhatsApp OTP password reset feature for Check Check City. Users can reset their password using an OTP sent via WhatsApp.

## Features
✅ **Password Reset Only**: OTP is used exclusively for password reset, not login
✅ **WhatsApp Delivery**: OTP codes are sent via Twilio WhatsApp API
✅ **Time-based Expiry**: OTP expires after 10 minutes
✅ **Secure Flow**: Three-step verification (phone → OTP → new password)
✅ **Error Handling**: User-friendly error messages at each step

## Setup Instructions

### 1. Get Twilio Credentials
1. Sign up at [twilio.com](https://www.twilio.com)
2. Create a WhatsApp Business Account
3. Get your WhatsApp Sandbox number (or production number)
4. Copy your Account SID and Auth Token from the Twilio Console

### 2. Update Environment Variables
Edit `.env.local`:
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155552671
```

**Note**: Replace with your actual Twilio credentials and WhatsApp number.

### 3. Test the Feature
1. Open the application at http://localhost:3000/cart
2. Click "Forgot password?" link in the login form
3. Enter your phone number
4. Check your WhatsApp for the OTP
5. Enter the OTP when prompted
6. Set your new password

## Technical Implementation

### API Routes

#### POST `/api/send-otp`
Sends OTP via WhatsApp to user's phone number.

**Request**:
```json
{
  "phone": "0549537343"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "OTP sent to WhatsApp"
}
```

**Response** (Error):
```json
{
  "error": "Twilio credentials not configured"
}
```

#### PUT `/api/verify-otp`
Verifies the OTP code before allowing password reset.

**Request**:
```json
{
  "phone": "0549537343",
  "otp": "123456"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "OTP verified"
}
```

#### POST `/api/verify-otp`
Resets the password after OTP verification.

**Request**:
```json
{
  "phone": "0549537343",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Components

#### PasswordResetModal (`src/components/PasswordResetModal.tsx`)
Three-step modal for password reset:

1. **Phone Step**: User enters phone number
2. **OTP Step**: User enters 6-digit code from WhatsApp
3. **Password Step**: User sets new password

Features:
- Smooth animations between steps
- Real-time validation
- Clear error messages
- Loading states during API calls
- Success confirmation

#### Cart Page Integration (`src/app/cart/page.tsx`)
- Added "Forgot Password" link below password field
- Integrates PasswordResetModal
- Link appears only for returning users (login form, not signup)

### Data Storage

#### OTP Store (`src/app/api/otp-store.ts`)
In-memory store for active OTPs and verified states:

```typescript
interface OTPRecord {
  code: string;
  expiresAt: number; // Unix timestamp
}
```

**Note**: For production, migrate to Redis or database storage.

### Security Features

1. **OTP Expiry**: 10 minutes after generation
2. **One-time Use**: OTP deleted after successful verification
3. **Password Hashing**: Uses bcryptjs with 10 salt rounds
4. **Rate Limiting**: (Recommended to implement)
5. **HTTPS Only**: Ensure all traffic is encrypted

## User Flow

```
1. User visits /cart
2. Clicks "Forgot password?"
3. Enters phone number
4. Receives WhatsApp OTP
5. Enters OTP code
6. Sets new password
7. Password updated in database
8. Modal closes automatically
9. User can login with new password
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Phone number required" | User didn't enter phone | Enter valid phone number |
| "Twilio credentials not configured" | Missing env variables | Add credentials to .env.local |
| "Invalid or expired OTP" | OTP expired or not found | Request new OTP |
| "Incorrect OTP" | Wrong OTP code entered | Re-check WhatsApp message |
| "Password must be at least 6 characters" | Password too short | Use stronger password |
| "Passwords do not match" | Password and confirm don't match | Re-enter passwords |

## Testing Checklist

- [ ] OTP sends successfully to WhatsApp
- [ ] OTP expires after 10 minutes
- [ ] Cannot use expired OTP
- [ ] Password updates in Supabase
- [ ] Can login with new password
- [ ] Old password no longer works
- [ ] Error messages display correctly
- [ ] Mobile responsive design works
- [ ] Loading states show during API calls
- [ ] Modal can be closed at any time

## Future Enhancements

1. **Rate Limiting**: Limit OTP requests per phone number
2. **SMS Fallback**: Send OTP via SMS if WhatsApp unavailable
3. **Resend OTP**: Allow user to resend OTP without restarting
4. **Remember This Device**: Option to skip 2FA on trusted devices
5. **Admin Dashboard**: Monitor failed password reset attempts
6. **Email Confirmation**: Send confirmation email after password reset
7. **Redis Storage**: Replace in-memory store for production scaling

## Troubleshooting

### OTP Not Received
- Check Twilio credentials are correct
- Ensure WhatsApp number is valid
- Verify user's phone number format
- Check Twilio dashboard for failed messages

### API Routes Not Found
- Ensure files are in correct path: `src/app/api/*/route.ts`
- Restart dev server after creating new routes
- Check terminal for compilation errors

### Environment Variables Not Loading
- Ensure `.env.local` file exists in project root
- Restart dev server after updating `.env.local`
- Use `NEXT_PUBLIC_` prefix for client-side access (not used here)

## Deployment

When deploying to production:

1. **Environment Variables**: Set Twilio credentials in hosting platform
2. **OTP Storage**: Migrate from in-memory to Redis/database
3. **Rate Limiting**: Implement to prevent abuse
4. **Monitoring**: Set up alerts for failed password resets
5. **Backup**: Ensure OTP store persistence

## References

- [Twilio Documentation](https://www.twilio.com/docs)
- [WhatsApp Business API](https://www.twilio.com/whatsapp)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

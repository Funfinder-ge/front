# Email API Documentation

## Overview
This document describes the email API endpoint that needs to be implemented on the backend to send ticket confirmation emails.

## Endpoint

### POST `/api/v5/email/send-ticket-confirmation`

Sends ticket confirmation emails to multiple recipients when a ticket is purchased.

### Request Body

```json
{
  "order_number": "ORD-1234567890-001",
  "customer_name": "John Doe",
  "customer_email": "customer@example.com",
  "customer_phone": "+995555123456",
  "activity_name": "Yacht Tour",
  "amount": 150.00,
  "people_count": 2,
  "event_date": "2024-12-25",
  "payment_method": "BOG",
  "event_details": {
    "description": "Beautiful yacht tour around the coast",
    "location": "Batumi Port",
    "city": "Batumi",
    "address": "Batumi Port, Main Pier",
    "time": "10:00",
    "image": "https://example.com/image.jpg"
  },
  "recipients": [
    "info@funfinder.ge",
    "customer@example.com",
    "support@funfinder.ge"
  ]
}
```

### Response

```json
{
  "success": true,
  "message": "Emails sent successfully",
  "emails_sent": 3,
  "recipients": [
    "info@funfinder.ge",
    "customer@example.com",
    "support@funfinder.ge"
  ]
}
```

## Email Template Requirements

The backend should send HTML emails with the following information:

### Email Subject
`Ticket Confirmation - Order #ORD-1234567890-001`

### Email Content Should Include:

1. **Order Information**
   - Order Number
   - Order Date
   - Payment Status

2. **Customer Information**
   - Customer Name
   - Customer Email
   - Customer Phone

3. **Activity/Event Details**
   - Activity Name
   - Description
   - Location
   - City
   - Address
   - Event Date
   - Event Time

4. **Booking Details**
   - Number of Participants
   - Total Amount
   - Payment Method

5. **Additional Information**
   - QR Code (if available)
   - Cancellation Policy
   - Contact Information

### Email Recipients

The system should send emails to:
1. **info@funfinder.ge** - Main company email (always included)
2. **Customer Email** - The customer who purchased the ticket
3. **support@funfinder.ge** - Support email (or another email you specify)

## Implementation Notes

- The endpoint should handle email sending asynchronously to avoid blocking the payment confirmation response
- Email sending failures should be logged but should not fail the payment confirmation
- The email service should use a reliable email provider (e.g., SendGrid, AWS SES, SMTP)
- Consider implementing email templates for consistent formatting
- Include error handling for invalid email addresses
- Rate limiting should be considered to prevent abuse

## Frontend Integration

The frontend automatically calls this endpoint when:
- Payment status is `success`
- Order details are successfully fetched
- User is redirected to `/payment/status/:orderNumber?status=success`

The frontend service is located at: `front/src/services/emailService.js`

## Testing

To test the email functionality:

1. Complete a ticket purchase
2. Check that payment status is `success`
3. Verify emails are sent to all 3 recipients:
   - info@funfinder.ge
   - Customer's email
   - support@funfinder.ge (or configured email)

## Error Handling

If the email endpoint is not available or returns an error:
- The frontend will log the error but not show it to the user
- Payment confirmation will still be shown as successful
- Backend payment callback should also trigger email sending as a fallback


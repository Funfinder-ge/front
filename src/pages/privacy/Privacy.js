import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import {
  PrivacyTip,
  Lock,
  Visibility,
  Cookie,
  Policy,
  Email,
  Update,
  Person,
  Share,
  DeleteOutline,
} from '@mui/icons-material';

const SECTIONS = [
  {
    icon: <Person />,
    title: '1. Information We Collect',
    body: [
      'Account data: name, email, phone number, country, password (stored as a salted hash).',
      'Booking data: events you reserve, dates, number of participants, special notes.',
      'Payment data: handled by our payment processors (Bank of Georgia, Google Pay, Apple Pay). Funfinder never stores your full card number or CVV. We retain only an order ID and a redacted/last-4 reference.',
      'Device & usage data: IP address, browser type, language, pages visited, timestamps. Used for security and analytics.',
      'Location data: only when you explicitly grant browser permission for nearby-activity discovery.',
    ],
  },
  {
    icon: <Visibility />,
    title: '2. How We Use Your Data',
    body: [
      'Process bookings and deliver tickets / confirmations.',
      'Authenticate you and protect your account (login attempts, suspicious activity).',
      'Send transactional emails: order confirmations, payment receipts, ticket QR codes.',
      'Provide customer support when you contact us.',
      'Improve the platform: aggregate, de-identified analytics — never to sell your individual data.',
      'Comply with legal obligations (tax, anti-fraud, lawful requests).',
    ],
  },
  {
    icon: <Share />,
    title: '3. Sharing With Third Parties',
    body: [
      'Activity providers: we share booking details necessary to deliver the experience (your name, contact, party size, date).',
      'Payment processors: Bank of Georgia, Google Pay, Apple Pay — they receive only what is required to authorise the transaction.',
      'Email delivery: transactional email service used to send your tickets.',
      'Hosting & infrastructure: cloud providers running the website and database.',
      'Authorities: only when legally required (court order, regulator request).',
      'We do not sell or rent your personal data to advertisers.',
    ],
  },
  {
    icon: <Cookie />,
    title: '4. Cookies & Local Storage',
    body: [
      'Essential cookies: session token, language, currency preference. Required for the site to work.',
      'Analytics cookies: Google Analytics (gtag) — measures aggregate traffic; you can opt out via browser settings.',
      'You can clear cookies at any time from your browser settings. Doing so will sign you out and reset your preferences.',
    ],
  },
  {
    icon: <Lock />,
    title: '5. Data Security',
    body: [
      'All traffic is served over HTTPS with TLS 1.2+.',
      'Passwords are hashed (never stored in plain text).',
      'Payment data is tokenised by the payment processor — Funfinder does not see card numbers.',
      'Database access is restricted to authorised personnel and audited.',
      'No system is perfectly secure; we promise reasonable safeguards, not absolute protection.',
    ],
  },
  {
    icon: <DeleteOutline />,
    title: '6. Data Retention',
    body: [
      'Account data: kept while your account is active. Delete the account and we erase the personal record (ledger entries needed for tax / accounting are retained per Georgian law, typically 5 years).',
      'Booking and payment records: retained as required by financial regulations (typically 5 years).',
      'Logs: rotated and purged within 12 months unless needed for an active investigation.',
    ],
  },
  {
    icon: <Policy />,
    title: '7. Your Rights',
    body: [
      'Access: request a copy of the personal data we hold about you.',
      'Rectification: ask us to correct inaccurate or out-of-date data.',
      'Erasure: ask us to delete your data, subject to retention requirements above.',
      'Portability: request an export of your data in a structured format.',
      'Objection: opt out of non-essential analytics.',
      'Withdraw consent: any consent you gave (e.g. location, marketing) can be withdrawn at any time.',
      'To exercise any of these, email info@funfinder.ge from the address tied to your account. We respond within 30 days.',
    ],
  },
  {
    icon: <Email />,
    title: '8. International Transfers',
    body: [
      'Some of our service providers (cloud hosting, email delivery, analytics) may process data outside Georgia. We rely on standard contractual clauses and the providers’ certifications to keep your data protected to a comparable standard.',
    ],
  },
  {
    icon: <Person />,
    title: '9. Children',
    body: [
      'Funfinder is not intended for children under 16. If you believe a child has created an account, contact us and we will delete it.',
    ],
  },
  {
    icon: <Update />,
    title: '10. Changes to This Policy',
    body: [
      'We may update this Privacy Policy as the platform evolves. The "Last updated" date at the top of the page reflects the current version. Material changes will be communicated by email or a banner on the site.',
    ],
  },
];

const Privacy = () => {
  const lastUpdated = '2026-05-02';

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #fdf6f9 0%, #ffffff 50%)', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            border: '1px solid rgba(135,0,58,0.08)',
            boxShadow: '0 12px 40px rgba(135,0,58,0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #87003A, #c1004f)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(135,0,58,0.3)',
              }}
            >
              <PrivacyTip sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.6rem', md: '2.2rem' },
                  background: 'linear-gradient(135deg, #87003A 0%, #c1004f 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                Privacy Policy
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
            Funfinder ("we", "us") values your privacy. This page explains what
            personal data we collect when you use{' '}
            <MuiLink href="https://funfinder.ge" underline="hover" color="#87003A">
              funfinder.ge
            </MuiLink>
            , how we use it, and what choices you have. By using the site you
            agree to the practices described here.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SECTIONS.map((section) => (
              <Box key={section.title}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      background: 'rgba(135,0,58,0.08)',
                      color: '#87003A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: '#222', fontSize: { xs: '1.05rem', md: '1.2rem' } }}
                  >
                    {section.title}
                  </Typography>
                </Box>
                <Box component="ul" sx={{ pl: 2.5, m: 0, color: 'text.secondary' }}>
                  {section.body.map((line, i) => (
                    <Box
                      component="li"
                      key={i}
                      sx={{ mb: 0.75, lineHeight: 1.6, fontSize: '0.95rem' }}
                    >
                      {line}
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(135,0,58,0.06), rgba(255,193,7,0.08))',
              border: '1px solid rgba(135,0,58,0.12)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#87003A', mb: 1 }}>
              Contact
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Questions, requests, or complaints about this policy:
            </Typography>
            <Typography variant="body2">
              Email:{' '}
              <MuiLink href="mailto:info@funfinder.ge" underline="hover" color="#87003A">
                info@funfinder.ge
              </MuiLink>
            </Typography>
            <Typography variant="body2">
              Website:{' '}
              <MuiLink href="https://funfinder.ge" underline="hover" color="#87003A">
                funfinder.ge
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Privacy;

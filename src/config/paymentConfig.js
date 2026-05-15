/**
 * Payment Configuration
 * Centralized configuration for all payment methods
 */

// Available payment methods from backend
export const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'bog_p2p', label: 'BoG P2P Transfer' },
  { value: 'bog_loyalty', label: 'BoG Loyalty Points' },
  { value: 'bog_loan', label: 'BoG Installments' },
  { value: 'bnpl', label: 'Buy Now Pay Later' },
  { value: 'google_pay', label: 'Google Pay' },
  { value: 'apple_pay', label: 'Apple Pay' },
  { value: 'gift_card', label: 'Gift Card' }
];

export const PAYMENT_CONFIG = {
  // BOG Payment Gateway
  bog: {
    baseUrl: 'https://ipay.ge',
    merchantId: process.env.REACT_APP_BOG_MERCHANT_ID || 'your_merchant_id',
    secretKey: process.env.REACT_APP_BOG_SECRET_KEY || 'your_secret_key',
    returnUrl: `${window.location.origin}/payment/success`,
    cancelUrl: `${window.location.origin}/payment/cancel`,
    notifyUrl: `https://base.funfinder.ge/api/v5/payment/bog/notify`
  },

  // Apple Pay (Bank of Georgia external integration)
  applePay: {
    merchantId: process.env.REACT_APP_APPLE_PAY_MERCHANT_ID || 'merchant.com.funfinder.ge',
    displayName: process.env.REACT_APP_APPLE_PAY_DISPLAY_NAME || 'Funfinder',
    domain:
      process.env.REACT_APP_APPLE_PAY_DOMAIN ||
      (typeof window !== 'undefined' ? window.location.hostname : 'funfinder.ge'),
    countryCode: process.env.REACT_APP_APPLE_PAY_COUNTRY || 'GE',
    currencyCode: process.env.REACT_APP_APPLE_PAY_CURRENCY || 'GEL',
    supportedNetworks: ['visa', 'masterCard', 'amex'],
    merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
    apiVersion: 3,
    // Backend endpoint that proxies merchant validation to BoG.
    validateMerchantUrl:
      process.env.REACT_APP_APPLE_PAY_VALIDATE_URL ||
      'https://base.funfinder.ge/api/v5/payment/apple-pay/validate-merchant',
    // Backend endpoint that creates the BoG order with
    //   { payment_method: ["apple_pay"], config: { apple_pay: { external: true } } }
    // and forwards the Apple Pay token; returns BoG response with _links.accept.href.
    processUrl:
      process.env.REACT_APP_APPLE_PAY_PROCESS_URL ||
      'https://base.funfinder.ge/api/v5/payment/apple-pay/process'
  },

  // Google Pay Configuration (Bank of Georgia external integration)
  googlePay: {
    apiVersion: 2,
    apiVersionMinor: 0,
    environment: process.env.REACT_APP_GOOGLE_PAY_ENV || 'TEST',
    merchantInfo: {
      merchantId: process.env.REACT_APP_GOOGLE_PAY_MERCHANT_ID || 'BCR2DN5TU3P7L4RG',
      merchantName: process.env.REACT_APP_GOOGLE_PAY_MERCHANT_NAME || 'Funfinder'
    },
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: process.env.REACT_APP_GOOGLE_PAY_GATEWAY || 'georgiancard',
            gatewayMerchantId:
              process.env.REACT_APP_GOOGLE_PAY_GATEWAY_MERCHANT_ID || 'BCR2DN4TXKPITITV'
          }
        }
      }
    ],
    checkoutOption: 'DEFAULT',
    // GET endpoint that returns the BoG tokenization spec to plug into Google Pay.
    // Response shape: { tokenization_specification: { type, parameters: { gateway, gatewayMerchantId } } }.
    configUrl:
      process.env.REACT_APP_GOOGLE_PAY_CONFIG_URL ||
      'https://base.funfinder.ge/api/v5/payment/bog/google-pay/config',
    // POST endpoint that creates the BoG order from { order_number, google_pay_token }.
    // Returns BoG response; if it contains _links.redirect.href the frontend redirects there for 3DS.
    processUrl:
      process.env.REACT_APP_GOOGLE_PAY_PROCESS_URL ||
      'https://base.funfinder.ge/api/v5/payment/bog/google-pay/initiate'
  },

  // General Payment Settings
  general: {
    currency: 'GEL',
    countryCode: 'GE',
    timeout: 30 * 60 * 1000, // 30 minutes
    retryAttempts: 3,
    retryDelay: 2000 // 2 seconds
  }
};

/**
 * Get payment configuration for a specific method
 * @param {string} method - Payment method ('bog', 'applePay', 'googlePay')
 * @returns {Object} Payment configuration
 */
export const getPaymentConfig = (method) => {
  return PAYMENT_CONFIG[method] || null;
};

/**
 * Get payment method label by value
 * @param {string} methodValue - Payment method value
 * @returns {string} Payment method label
 */
export const getPaymentMethodLabel = (methodValue) => {
  const method = PAYMENT_METHODS.find(m => m.value === methodValue);
  return method ? method.label : methodValue;
};

/**
 * Validate payment configuration
 * @param {string} method - Payment method to validate
 * @returns {boolean} True if configuration is valid
 */
export const validatePaymentConfig = (method) => {
  const config = getPaymentConfig(method);
  if (!config) return false;

  switch (method) {
    case 'bog':
      return !!(config.merchantId && config.secretKey && config.merchantId !== 'your_merchant_id');
    case 'applePay':
      return !!(
        config.merchantId &&
        config.countryCode &&
        config.currencyCode &&
        config.domain
      );
    case 'googlePay':
      return !!(config.merchantInfo && config.merchantInfo.merchantId);
    default:
      return false;
  }
};

export default PAYMENT_CONFIG;

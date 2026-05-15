/**
 * Payment Integration Verification Script
 * Checks if all payment components are properly integrated and configured
 */

import { getPaymentConfig, validatePaymentConfig } from '../config/paymentConfig';

/**
 * Verify payment component integration
 * @returns {Object} Verification results
 */
export const verifyPaymentIntegration = () => {
  const results = {
    success: true,
    errors: [],
    warnings: [],
    components: {},
    configuration: {}
  };

  // Check if payment components exist
  try {
    // Check BOGPayment component
    const BOGPayment = require('../components/BOGPayment').default;
    results.components.bog = {
      exists: true,
      name: 'BOGPayment',
      status: 'available'
    };
  } catch (error) {
    results.success = false;
    results.errors.push('BOGPayment component not found');
    results.components.bog = {
      exists: false,
      name: 'BOGPayment',
      status: 'missing'
    };
  }

  try {
    // Check ApplePayButton component
    const ApplePayButton = require('../components/ApplePayButton').default;
    results.components.applePay = {
      exists: true,
      name: 'ApplePayButton',
      status: 'available'
    };
  } catch (error) {
    results.success = false;
    results.errors.push('ApplePayButton component not found');
    results.components.applePay = {
      exists: false,
      name: 'ApplePayButton',
      status: 'missing'
    };
  }

  try {
    // Check GooglePayButton component
    const GooglePayButton = require('../components/GooglePayButton').default;
    results.components.googlePay = {
      exists: true,
      name: 'GooglePayButton',
      status: 'available'
    };
  } catch (error) {
    results.success = false;
    results.errors.push('GooglePayButton component not found');
    results.components.googlePay = {
      exists: false,
      name: 'GooglePayButton',
      status: 'missing'
    };
  }

  // Check payment configuration
  try {
    const paymentMethods = ['bog', 'applePay', 'googlePay'];
    
    paymentMethods.forEach(method => {
      const config = getPaymentConfig(method);
      const isValid = validatePaymentConfig(method);
      
      results.configuration[method] = {
        configured: !!config,
        valid: isValid,
        config: config ? 'configured' : 'missing'
      };

      if (!config) {
        results.warnings.push(`${method} configuration not found`);
      } else if (!isValid) {
        results.warnings.push(`${method} configuration is invalid or incomplete`);
      }
    });
  } catch (error) {
    results.success = false;
    results.errors.push('Payment configuration error: ' + error.message);
  }

  // Check environment variables
  const requiredEnvVars = [
    'REACT_APP_BOG_MERCHANT_ID',
    'REACT_APP_BOG_SECRET_KEY',
    'REACT_APP_GOOGLE_PAY_MERCHANT_ID',
    'REACT_APP_GOOGLE_PAY_GATEWAY_MERCHANT_ID'
  ];

  const optionalEnvVars = [
    'REACT_APP_APPLE_PAY_MERCHANT_ID'
  ];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      results.warnings.push(`Environment variable ${envVar} is not set`);
    }
  });

  optionalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      results.warnings.push(`Optional environment variable ${envVar} is not set`);
    }
  });

  // Check if Payment.js has been updated
  try {
    const PaymentPage = require('../pages/payment/Payment').default;
    results.paymentPage = {
      exists: true,
      status: 'available'
    };
  } catch (error) {
    results.success = false;
    results.errors.push('Payment page not found or has errors');
    results.paymentPage = {
      exists: false,
      status: 'error'
    };
  }

  // Check orderApiService methods
  try {
    const orderApiService = require('../services/orderApi').default;
    const requiredMethods = ['createOrder', 'initiatePayment', 'updatePaymentStatus'];
    
    results.orderApi = {
      exists: true,
      methods: {}
    };

    requiredMethods.forEach(method => {
      if (typeof orderApiService[method] === 'function') {
        results.orderApi.methods[method] = 'available';
      } else {
        results.success = false;
        results.errors.push(`orderApiService.${method} method not found`);
        results.orderApi.methods[method] = 'missing';
      }
    });
  } catch (error) {
    results.success = false;
    results.errors.push('orderApiService not found or has errors');
    results.orderApi = {
      exists: false,
      methods: {}
    };
  }

  return results;
};

/**
 * Log verification results to console
 * @param {Object} results - Verification results
 */
export const logVerificationResults = (results) => {
  console.group('🔍 Payment Integration Verification Results');
  
  if (results.success) {
    console.log('✅ All payment components are properly integrated');
  } else {
    console.error('❌ Some issues found with payment integration');
  }

  console.group('📦 Components Status');
  Object.entries(results.components).forEach(([key, component]) => {
    const status = component.exists ? '✅' : '❌';
    console.log(`${status} ${component.name}: ${component.status}`);
  });
  console.groupEnd();

  console.group('⚙️ Configuration Status');
  Object.entries(results.configuration).forEach(([key, config]) => {
    const status = config.configured ? '✅' : '⚠️';
    const valid = config.valid ? '✅' : '⚠️';
    console.log(`${status} ${key}: ${config.configured} (${valid ? 'valid' : 'invalid'})`);
  });
  console.groupEnd();

  if (results.errors.length > 0) {
    console.group('❌ Errors');
    results.errors.forEach(error => console.error(error));
    console.groupEnd();
  }

  if (results.warnings.length > 0) {
    console.group('⚠️ Warnings');
    results.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }

  console.groupEnd();
};

/**
 * Run verification and log results
 */
export const runVerification = () => {
  const results = verifyPaymentIntegration();
  logVerificationResults(results);
  return results;
};

// Auto-run verification if this script is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment - add to window for manual testing
  window.verifyPaymentIntegration = verifyPaymentIntegration;
  window.runPaymentVerification = runVerification;
}

export default {
  verifyPaymentIntegration,
  logVerificationResults,
  runVerification
};

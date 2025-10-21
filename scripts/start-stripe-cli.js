const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const path = require('path');

require('dotenv').config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

if (!STRIPE_SECRET_KEY || !NEXTAUTH_URL) {
  console.error('Missing environment variables: STRIPE_SECRET_KEY or NEXTAUTH_URL.');
  process.exit(1);
}

let stripeProcess = null;

function startStripeCLIAndGetWebhookSecret() {
  return new Promise((resolve, reject) => {
    const command = 'stripe';
    const args = [
      'listen',
      '--forward-to',
      `${NEXTAUTH_URL}/api/stripe/webhook`,
      '--api-key',
      `${STRIPE_SECRET_KEY}`,
    ];

    stripeProcess = spawn(command, args);

    if (!stripeProcess) {
      reject(new Error('Stripe process could not be started.'));
      return;
    }

    stripeProcess?.stderr.on('data', (data) => {
      const outputBuffer = data.toString().trim();

      if (outputBuffer.includes('Ready!')) {
        const secretRegex = /whsec_[a-zA-Z0-9]+/;

        try {
          const secretMatch = outputBuffer.match(secretRegex);
          if (secretMatch) {
            resolve(secretMatch[0]);
          } else {
            reject(new Error('No webhook secret found in output.'));
          }
        } catch (error) {
          reject(new Error(`Error processing output: ${error.message}`));
        }
      }
    });

    stripeProcess.on('error', (error) => {
      reject(new Error(`Stripe CLI error: ${error.message}`));
    });

    stripeProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Stripe CLI process exited with code ${code}.`);
      }
      stripeProcess = null;
    });
  });
}

async function start() {
  try {
    const webhookSecret = await startStripeCLIAndGetWebhookSecret();
    console.log('Stripe webhook secret:', webhookSecret);

    process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;

    const repoRootPath = path.resolve(__dirname, '../');
    const secretFilePath = path.join(repoRootPath, '.stripe');
    writeFileSync(secretFilePath, webhookSecret);
    console.log(`Webhook secret saved to ${secretFilePath}`);
  } catch (error) {
    console.error('Error setting up Stripe CLI:', error.message);
  }
}

function stop() {
  if (stripeProcess) {
    stripeProcess.kill();
    stripeProcess = null;
    console.log('Stopping Stripe CLI');
  }
}

module.exports = { start, stop, startStripeCLIAndGetWebhookSecret };

if (require.main === module) {
  start()
    .then(() => console.log('Stripe CLI setup completed.'))
    .catch((error) => console.error('Setup failed:', error));
}
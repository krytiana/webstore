NovaShop Business Store v2

A reusable, production-oriented full-stack e-commerce platform for building, customizing, deploying, and selling business websites.

NovaShop is designed as a base product for Code Carthub. Each client should receive their own configuration, production environment, credentials, payment accounts, database, and deployment.

License: NovaShop is proprietary software owned by Code Carthub. Client use is governed by the applicable commercial license. See LICENSE.md.

Features

Storefront

Responsive business storefront

Product listings and product details

Categories and product search

Shopping cart

Wishlist

Recently viewed products

Customer accounts

Address management

Order history and delivery tracking

Administration

Protected admin dashboard

Product creation, editing, and deletion

Product image management

Order management

Customer/order administration

Client-specific business configuration

Payments

Stripe Checkout integration

Paystack integration

Provider-specific signed webhooks

Server-side order/payment snapshots

Payment amount and currency verification

Payment-provider verification before an order is marked paid

Both payment providers are optional and disabled by default.

Security

JWT-based authentication

Protected admin routes

Secure authentication cookies

Password hashing

Password reset flow

Refresh-session invalidation

Rate limiting

Request body size limits

Security headers

Same-origin protection for cookie-authenticated mutations

Upload type, size, and content validation

Production environment validation

Safe error handling

Health and readiness endpoints

Technology Stack

Node.js: 20+

Backend: Express 5

Language: TypeScript

Database: MongoDB with Mongoose

Templates: EJS

Authentication: JWT

Payments: Stripe Checkout and Paystack

Images: ImageKit

Email: Brevo

Testing: Node test runner

Project Requirements

Before installation, make sure you have:

Node.js 20 or newer

npm

MongoDB

A production domain for deployment

An email provider if transactional email is required

ImageKit credentials if image uploads are enabled

Stripe and/or Paystack credentials if online payments are enabled

Installation

1. Install dependencies

npm ci

2. Create the environment file

Copy the example environment file:

cp .env.example .env

On Windows PowerShell:

Copy-Item .env.example .env

Never commit .env to source control.

3. Generate application secrets

Generate authentication secrets with:

node src/utils/generateSecrets.js

The script writes the generated values to .env and does not print the secrets.

4. Configure the environment

Open .env and configure the required values.

At minimum, configure:

MongoDB connection

Application/client URL

JWT/authentication secrets

Initial admin credentials

Optional services can be configured when needed:

Stripe

Paystack

Brevo

ImageKit

Use separate credentials and accounts for every client deployment.

5. Run validation

npm run check

6. Start development

npm run dev

Environment Configuration

Use .env.example as the source of truth for supported environment variables.

Do not place production secrets directly in source code.

Never commit:

.env

Database credentials

JWT secrets

Stripe secret keys

Paystack secret keys

SMTP/email credentials

Private keys

Client production data

Admin Setup

The first application startup can provision the initial admin account from:

ADMIN_EMAIL

ADMIN_PASSWORD

ADMIN_USERNAME

ADMIN_FULLNAME

ADMIN_COUNTRY

The initial admin password must be at least 12 characters.

After deployment, use a unique production admin password and protect the account with the client's normal security procedures.

The admin dashboard is available at:

/admin

Payments

Payment providers are disabled by default.

Enable only a provider that has been completely configured and tested.

Stripe

Webhook endpoint:

/api/stripe/webhook

Stripe webhook requests require the provider's signature verification and raw request body.

Paystack

Webhook endpoint:

/api/paystack/webhook

Payment security

NovaShop does not trust payment totals supplied by the browser.

The checkout flow:

Authenticates the customer.

Reads the customer's cart from the server.

Calculates the order total server-side.

Creates a pending order/payment snapshot.

Starts the provider checkout using the frozen amount.

Verifies the provider session/reference after payment.

Verifies the expected amount and currency.

Marks the order as paid only after successful verification.

Configure and test webhooks in the client's actual production payment accounts before declaring a deployment complete.

Email

Configure the supported email provider when password-reset or transactional email is required.

Use a verified production sender/domain where required by the email provider.

The client is responsible for maintaining its email provider account and complying with that provider's policies.

Image Uploads

If ImageKit is enabled, configure the client's ImageKit account and production credentials.

Uploads are subject to server-side validation for supported file types and size.

Do not use a shared production image account across unrelated clients unless that arrangement is intentionally managed by Code Carthub.

Branding and Client Configuration

NovaShop is designed to be customized for each client.

Before production deployment, configure at least:

Business name

Logo and branding

Primary contact details

Domain

Currency

Business information

Payment providers

Email configuration

Image storage

Admin account

Each client should have an independent production database and production credentials.

Production Deployment

Build

npm ci
npm run build

Start

npm start

Health check

/api/health

The health endpoint returns a successful response only when the application and MongoDB connection are healthy.

Readiness check

/api/ready

Use the readiness endpoint with hosting/load-balancer deployment checks where appropriate.

Production requirements

Before going live:

Use HTTPS.

Use a production domain.

Use a separate MongoDB database for the client.

Use unique production secrets.

Use unique admin credentials.

Configure production payment accounts.

Configure and verify payment webhooks.

Configure transactional email.

Configure image storage where required.

Configure database backups.

Test the complete checkout-to-order flow.

Test the site on mobile and desktop.

Confirm that no development credentials or test data remain.

Client Deployment Model

NovaShop is intended to be deployed separately for each client.

A normal client deployment should have:

Client
├── Own domain
├── Own production database
├── Own admin account
├── Own application secrets
├── Own payment accounts
├── Own email configuration
└── Own production data

Do not share one client's production credentials, database, payment account, or private media with another client.

Updating a Client Deployment

Because NovaShop is a reusable product, keep the original Code Carthub source separate from individual client deployments.

When preparing an update:

Review the change.

Test the reusable base version.

Check whether the client has custom modifications.

Back up the client's database and relevant files.

Apply the update in a staging environment where possible.

Run the test/check suite.

Deploy the approved version.

Verify health, authentication, storefront, checkout, payments, and admin functions.

Client-specific customizations should be documented before applying major updates.

Testing

Run the project checks with:

npm run check

Before a client deployment, also perform a manual production QA pass covering:

Registration

Login/logout

Password reset

Product browsing

Cart

Wishlist

Address management

Checkout

Payment

Payment webhook

Order creation

Order tracking

Admin product management

Admin order management

Mobile layout

HTTPS/domain

Backups

Important Security Rules

Never:

Commit .env files.

Commit production secrets.

Reuse client credentials.

Use a development database in production.

Use test payment keys in production.

Trust payment totals supplied by the browser.

Disable webhook signature verification.

Share one client's database with another client.

Ship client production data inside the reusable source package.

License

NovaShop is proprietary software owned by Code Carthub.

Clients may receive source code and may modify their licensed deployment according to the applicable commercial license, but receiving source code does not transfer ownership of the underlying reusable NovaShop software.

See LICENSE.md for the applicable license terms.

Support

Support depends on the client's purchased service plan.

For Assisted and Done4U plans, deployment assistance is provided through the agreed installation/deployment process and ends once the deployment process is completed.

New features, redesigns, integrations, and custom development are not automatically included and may require a separate quotation or agreement.

Client Handoff

The internal deployment checklist should be maintained separately by Code Carthub.

Do not include completed client deployment records, production credentials, secrets, or private infrastructure information in the reusable distribution package.

Recommended Distribution

A clean client distribution should contain the reusable application and documentation, but should not contain:

.env

Client databases

Production credentials

Private keys

Client uploads/media

Client customer data

Completed internal deployment records

Hosting credentials

Support and Commercial Terms

The software license and any project-specific agreement control the commercial relationship between Code Carthub and the client.

For licensing questions, support scope, custom development, or deployment services, refer to the client's purchase agreement or contact Code Carthub.

Product: NovaShop Business Store v2
Licensor: Code Carthub
License model: Perpetual, non-exclusive commercial license
Primary jurisdiction: Ghana
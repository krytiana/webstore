# DarkyMall E-Commerce Template

## Deployment Guide

DarkyMall is a production-ready full-stack e-commerce template built with:

* Node.js
* Express
* TypeScript
* MongoDB + Mongoose
* EJS Frontend
* JWT Authentication
* Stripe Payment Integration
* ImageKit Image Storage
* Admin Dashboard
* Product Management
* Shopping Cart
* Wishlist
* Order Management
* Order Tracking
* Password Reset System

---

# 1. Requirements

Before deploying DarkyMall, you will need accounts with the following services.

## MongoDB Atlas — Database

MongoDB stores your users, products, carts, orders, addresses, settings, and other application data.

Create a MongoDB Atlas account and create a database.

You will need your MongoDB connection string.

Official website:

https://www.mongodb.com/cloud/atlas

For additional help, visit:

https://codecarthub.com/documentation.html

---

## Stripe — Payment Processing

Stripe is used to receive card payments from customers.

Create a Stripe account and obtain:

* Secret Key
* Publishable Key
* Webhook Secret

Official website:

https://stripe.com

### Important

For testing, use Stripe test keys.

For a live store, switch to Stripe live keys before accepting real payments.

---

## ImageKit — Image Storage

ImageKit is used to store and deliver product images.

Create an ImageKit account and obtain:

* URL Endpoint
* Public Key
* Private Key

Official website:

https://imagekit.io

---

## Brevo — Email Service

Brevo is used by DarkyMall to send password-reset emails.

Create a Brevo account and obtain:

* Brevo API Key
* A verified sender email address

DarkyMall uses the Brevo API, so an SMTP key is not required.

Official website:

https://www.brevo.com

---

# 2. Generate Security Keys

DarkyMall uses two security keys for authentication:

```env
JWT_SECRET=
REFRESH_TOKEN_SECRET=
```

These values should be random and difficult to guess.

You do not need to use a specific number of characters, but **32+ random characters is recommended**. A longer randomly generated value provides stronger protection.

For example:

```env
JWT_SECRET=7844a6846fbd10ac81ac81acb4c5fafa51d89b54f67ec01a9e222ad2b6c002d8
REFRESH_TOKEN_SECRET=4f152f8f0596ee0c56d2d861d498f81c894289216c4ba210c8a12801b9f2a25
```

Do not use these example values in a real production deployment.

Generate your own random values.

If your hosting provider provides a secure random-value generator, you can use it.

---

# 3. Create the Administrator Account

DarkyMall automatically creates the administrator account the first time the server starts.

You must provide the administrator information through environment variables.

```env
ADMIN_EMAIL=example@gmail.com
ADMIN_PASSWORD=your-strong-password
ADMIN_USERNAME=admin
ADMIN_FULLNAME=Super Admin
ADMIN_COUNTRY=Ghana
```

After the first successful startup, the administrator account will be stored in MongoDB.

You can then log into the DarkyMall admin dashboard.

### Important

Use a strong administrator password.

Do not use simple passwords such as:

```text
123456
password
admin123
```

---

# 4. Environment Configuration

After creating your required service accounts and obtaining the required keys, add the following environment variables to your hosting provider.

**The variable names must be written exactly as shown below.**

Do not change:

```text
MONGO_URI
JWT_SECRET
REFRESH_TOKEN_SECRET
BREVO_API_KEY
EMAIL_SENDER
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
IMAGEKIT_URL_ENDPOINT
IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_USERNAME
ADMIN_FULLNAME
ADMIN_COUNTRY
```

Example:

```env
MONGO_URI=mongodb+srv://your-connection-string

JWT_SECRET=your-random-secret
REFRESH_TOKEN_SECRET=your-random-refresh-secret

BREVO_API_KEY=your-brevo-api-key
EMAIL_SENDER=your-verified-email@example.com

STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-imagekit-id
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-strong-password
ADMIN_USERNAME=admin
ADMIN_FULLNAME=Super Admin
ADMIN_COUNTRY=Ghana
```

### Important Security Notice

Never publish your real environment variables.

Do not upload your `.env` file to GitHub or include it in a public repository.

Never share:

* MongoDB passwords
* JWT secrets
* Refresh token secrets
* Stripe secret keys
* Stripe webhook secrets
* ImageKit private keys
* Brevo API keys
* Administrator passwords

---

# 5. Deploy the Application

Upload or connect the DarkyMall project to your hosting provider.

When configuring the deployment, use the following commands.

### Install Command

```bash
npm install
```

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

Make sure all required environment variables have been added before starting the application.

---

# 6. First Startup

After deployment, the server will:

1. Connect to MongoDB.
2. Check whether the administrator account exists.
3. Create the administrator account if necessary.
4. Start the DarkyMall application.
5. Allow customers to access the store.

Open the URL provided by your hosting provider.

Then log into:

```text
/admin
```

using the administrator credentials you configured.

---

# 7. Configure Stripe Webhooks

Stripe webhooks are required for reliable payment processing.

After your application is deployed, your hosting provider will give you a public application URL.

Use that URL to configure your Stripe webhook endpoint.

For example:

```text
https://your-store.example.com/api/stripe/webhook
```

Copy the webhook signing secret provided by Stripe and add it to:

```env
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

### Important

The exact webhook URL depends on the Stripe route used by your DarkyMall installation.

Check your project routes if you have customized the Stripe endpoints.

---

# 8. Test Your Store

Before making the website available to customers, test the following:

### Account

* Register a new account
* Log in
* Log out
* Refresh the page
* Test password reset

### Products

* View products
* Open product details
* Test categories
* Add products to cart
* Change quantities
* Remove products
* Test wishlist

### Address

* Add an address
* Set a default address
* Edit the address

### Checkout

* Add products to cart
* Select a shipping address
* Start Stripe checkout
* Complete a test payment
* Confirm the order is created
* Confirm the cart is cleared

### Orders

* View orders
* Open an order
* View order tracking
* Test administrator order-status updates

### Admin

* Log into the admin dashboard
* Create a product
* Edit a product
* Delete a product
* Update store settings
* Upload product images

---

# 9. Going Live

Before accepting real customer payments:

* Replace Stripe test keys with live Stripe keys.
* Verify your Stripe webhook.
* Verify your Brevo sender email.
* Verify your MongoDB production database.
* Use a strong administrator password.
* Confirm ImageKit uploads are working.
* Test registration and password reset.
* Test a complete checkout process.

Do not use Stripe test keys on a live store if you intend to receive real payments.

---

# 10. Troubleshooting

If the application does not start, check the hosting provider's deployment logs.

Common problems include:

### MongoDB connection error

Check:

```env
MONGO_URI=
```

Make sure:

* The connection string is correct.
* Your MongoDB Atlas network access allows the deployed server to connect.
* Your database credentials are correct.

### Stripe errors

Check:

```env
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Make sure the keys belong to the correct Stripe mode (test or live).

### Email errors

Check:

```env
BREVO_API_KEY=
EMAIL_SENDER=
```

Make sure the sender email has been verified in Brevo.

### Image upload errors

Check:

```env
IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
```

Make sure all three values belong to the same ImageKit account.

### Authentication errors

Check:

```env
JWT_SECRET=
REFRESH_TOKEN_SECRET=
```

Make sure both variables exist and contain strong random values.

---

# 11. Important Security Information

Environment variables contain sensitive information.

Never expose them in:

* GitHub repositories
* Public websites
* Screenshots
* Client-side JavaScript
* HTML
* EJS templates
* Browser developer tools

The following values must remain private:

```text
MONGO_URI
JWT_SECRET
REFRESH_TOKEN_SECRET
BREVO_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
IMAGEKIT_PRIVATE_KEY
ADMIN_PASSWORD
```

The Stripe publishable key is designed to be used by client-side applications, but the Stripe secret key must remain private.

---

# 12. CodeCarthub Documentation

For additional deployment and configuration help:

https://codecarthub.com/documentation.html

You can also use the CodeCarthub AI assistant for deployment guidelines and troubleshooting:

https://codecarthub.com/chat

---

# 13. License

This template is sold as a complete source-code product.

The buyer receives:

* Full source code
* Ability to customize the application
* Ability to deploy the application
* Ability to modify the application
* Ability to use the application for personal or business purposes

Please refer to the license included with your purchase for the complete terms and conditions.

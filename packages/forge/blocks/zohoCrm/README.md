# Zoho CRM Integration - Simple Configuration

This Zoho CRM integration block uses **Client Credentials Flow**, which is the simplest way to connect without complications.

## 🚀 Configuration (Only 4 fields)

### Step 1: Create Self Client in Zoho

1. Go to [Zoho Developer Console](https://api-console.zoho.com/)
2. Log in with your Zoho CRM account
3. Select **"Self Client"**
4. Click **"Create Now"**
5. Confirm by clicking **"OK"**

### Step 2: Get Client ID and Client Secret

1. Go to the **"Client Secret"** tab
2. Copy the **Client ID** and **Client Secret**

### Step 3: Get Organization ID (SOID)

1. Go to your Zoho CRM
2. Click on your **profile picture** (top right corner)
3. Click on the **dropdown** next to your organization name
4. Copy the **Org ID** (example: `600xxx46`)

### Step 4: Identify your Domain

According to your Zoho CRM location:

- **Global**: `com` (United States, rest of the world)
- **Europe**: `eu`
- **India**: `in`
- **China**: `com.cn`
- **Australia**: `com.au`

## ✅ Configure in Quick.bot

Simply fill in these 4 fields:

1. **Client ID**: The one you copied from the Developer Console
2. **Client Secret**: The one you copied from the Developer Console
3. **Organization ID**: The Org ID you copied (numbers only, e.g.: `600xxx46`)
4. **Domain**: Your domain according to your region (`com`, `eu`, `in`, etc.)

## 🎯 And you're done!

- ✅ No need for authorization codes
- ✅ No need for refresh tokens
- ✅ No need for callback URLs
- ✅ The system automatically handles token renewal

## 🧪 Test Connection

Use the **"Test Connection"** action to verify that everything works correctly.

## 📋 Available Actions

- **Test Connection**: Verifies that the connection works
- **Get Organization Info**: Gets information about your organization

## 🔧 Troubleshooting

### Error: "invalid_client"

- ✅ Verify your Client ID and Client Secret
- ✅ Make sure they are from a Self Client

### Error: "soid"

- ✅ Verify your Organization ID
- ✅ Must be numbers only (e.g.: `600xxx46`)

### Error: "scope"

- ✅ Make sure your Self Client has the necessary scopes
- ✅ Contact your Zoho CRM administrator if necessary

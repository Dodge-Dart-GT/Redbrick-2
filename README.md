# 🏗️ Red Brick Corporation - Forklift Management System

Welcome to the Red Brick Corporation (RBC) developer setup. This project is built on the MERN stack (MongoDB, Express, React, Node.js) with Material UI. 

To make collaboration seamless, this repository includes an automated setup script that handles dependency installation and environment scaffolding.

---

## 🛑 Prerequisites: Required Accounts & Keys
Before running the installer, you must set up your own developer accounts for the services this app relies on. **Do not ask for the production keys.**

You will need free tiers of the following services:

1. **MongoDB Atlas**
   * Create a free cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas).
   * Create a database user and password.
   * Get your connection string (URI) and replace `<password>` with your actual password.
2. **Cloudinary**
   * Sign up at [cloudinary.com](https://cloudinary.com/) for handling forklift image uploads.
   * You will need your `Cloud Name`, `API Key`, and `API Secret`.
3. **Mailtrap**
   * Sign up at [mailtrap.io](https://mailtrap.io/) to capture testing emails (like password resets or booking confirmations) without spamming real inboxes.
   * You will need your `Token`, `User`, and `Password` from a test inbox.
4. **Google reCAPTCHA**
   * Register a new site at [Google reCAPTCHA](https://www.google.com/recaptcha/admin) (v2/v3 depending on the current frontend implementation) to get your Secret Key.
5. **Node.js**
   * Ensure you have Node.js installed on your machine. 

---

## 🚀 Quick Start / Installation

We use an automated installer to get both the frontend and backend ready simultaneously.

### Step 1: Run the Installer
Open your terminal in the root folder of this project and run the setup script for your operating system:

* **Windows:** Double-click `install.bat`
* **Mac/Linux:** Run `bash install.sh` (or `./install.sh`)

*What this does:*
* Installs master controller dependencies in the root.
* Installs React dependencies in `/client`.
* Installs Node/Express dependencies in `/server`.
* Automatically generates a `server/.env` file from the template.

### Step 2: Add Your "Fuel" (Environment Variables)
Navigate to the `server/` directory and open the newly created `.env` file. 
Paste in the API keys and URIs you generated in the Prerequisites step. 

*Note: The server will crash on startup if the MongoDB URI or Cloudinary keys are left blank.*

### Step 3: Fire Up the Engine
Navigate back to the **root** folder of the project and run:

```bash
npm run dev
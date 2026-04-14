# 🏗️ Red Brick Corporation - Forklift Management System (v2)

Official developer repository for the RBC Forklift Management System. This is a high-performance MERN stack application (MongoDB, Express, React, Node.js) built with Material UI.

---

## 🛠️ Phase 1: Preparation
Before you begin, ensure your local environment has the following installed:
* **Node.js** (LTS version)
* **Git**
* **VS Code**

### External Service Requirements
You will need your own API keys for these services (free tiers are sufficient):
* **MongoDB Atlas**: A cloud database cluster for storing forklift and user data.
* **Cloudinary**: For hosting and managing forklift inventory images.
* **Mailtrap**: A testing SMTP server for system emails.
* **Google reCAPTCHA**: For securing the login and signup portals.

---

## 🚀 Phase 2: One-Click Installation

I have built an automated installer to handle all the heavy lifting across the `client` and `server` directories.

### 1. Clone the Repo
```bash
git clone [https://github.com/Dodge-Dart-GT/Redbrick-2.git](https://github.com/Dodge-Dart-GT/Redbrick-2.git)
cd Redbrick-2
2. Run the Installer
Windows: Double-click the install.bat file in the root folder.

Mac/Linux: Run chmod +x install.sh && ./install.sh in your terminal.

This script installs all dependencies for the root, frontend, and backend, then generates your local .env file.

3. Add Your "Fuel" (Environment Variables)
Go to the server/ folder and open the newly created .env file.

Paste your MongoDB URI, Cloudinary API keys, and other credentials into the fields.

Save the file. The engine will not start without a valid database connection.

4. Ignite the Engines
Return to the root folder and run:

Bash
npm run dev
The site will launch both the frontend and backend simultaneously using concurrently.

Frontend: http://localhost:5173

Backend: http://localhost:5000

📂 Project Layout
/client: React frontend and Material UI themes.

/server: Node/Express backend, Mongoose models, and API routes.

setup.js: The underlying logic for the automated installer.

⚠️ Security & Contributions
Keep it Private: Never commit your .env file. It is pre-blocked by .gitignore. Keep your credentials as secure as your "Vicky" keys.

Branches: Create a new branch for features: git checkout -b feature-name.

Audits: Before pushing, manually audit any new API routes with tools like OWASP ZAP or Burp Suite.


---
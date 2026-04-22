🏗️ Red Brick Corporation - Forklift Management System
Official developer repository for the RBC Forklift Management System. This is a full-stack MERN (MongoDB, Express, React, Node.js) application built with Material UI.

🛠️ Prerequisites
Ensure your local environment has the following tools installed:

Node.js (LTS version)

Git

VS Code (or preferred IDE)

Required Service Credentials
To run this application, you must configure your own instances of the following services:

MongoDB Atlas: A cloud database cluster for data persistence.

Cloudinary: Image hosting and management for inventory assets.

Mailtrap: An SMTP testing service for system-generated emails.

Google reCAPTCHA: Security keys for user authentication forms.

🚀 Installation & Setup
This repository includes automated scripts to streamline dependency management and environment configuration.

1. Clone the Repository
Bash
git clone https://github.com/Dodge-Dart-GT/Redbrick-2.git
cd Redbrick-2
2. Run the Installer
Execute the setup script from the root directory to install dependencies for the root, client, and server folders simultaneously.

Windows: Run install.bat

Mac/Linux: Run chmod +x install.sh && ./install.sh

3. Configure Environment Variables
Navigate to the server/ directory.

Open the newly generated .env file.

Input your specific MongoDB URI, Cloudinary keys, and other service credentials.

Save the file. The application will fail to initialize without a valid database connection.

4. Start the Application
Return to the root folder and execute:


"npm run dev" on Bash
This command utilizes concurrently to launch the Express backend and React frontend in a single terminal session.

Frontend: http://localhost:5173

Backend API: http://localhost:5000

📂 Project Structure
/client: React frontend source code and Material UI styling.

/server: Node.js/Express backend, Mongoose models, and API endpoints.

setup.js: Logic for the automated installation and environment scaffolding.

⚠️ Contribution & Security
Environment Protection: Never commit your .env file to the repository. It is ignored by .gitignore by default. Ensure your local credentials remain secure.

Feature Development: Create a new branch for all updates: git checkout -b feature-name.

Security Audits: Developers are encouraged to perform manual audits on new API routes using tools like OWASP ZAP or Burp Suite prior to submitting pull requests.

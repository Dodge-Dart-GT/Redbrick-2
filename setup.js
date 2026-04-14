const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Starting Red Brick Corporation installation...');

// Helper to run npm install in specific directories
const install = (dir) => {
  console.log(`\n📦 Installing dependencies in /${dir}...`);
  try {
    execSync('npm install', { cwd: path.join(__dirname, dir), stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Failed to install in ${dir}.`);
  }
};

// 1. Install dependencies for all parts of the app
install('.');      // Root
install('client'); // Frontend
install('server'); // Backend

// 2. Automate the .env setup for the server
const serverEnv = path.join(__dirname, 'server', '.env');
const serverExample = path.join(__dirname, 'server', '.env.example');

if (!fs.existsSync(serverEnv)) {
  if (fs.existsSync(serverExample)) {
    fs.copyFileSync(serverExample, serverEnv);
    console.log('\n✅ Created server/.env from template.');
  } else {
    console.log('\n⚠️  Notice: server/.env.example not found. Creating a blank template...');
    const template = "PORT=5000\nMONGO_URI=\nJWT_SECRET=\nCLOUDINARY_CLOUD_NAME=\nCLOUDINARY_API_KEY=\nCLOUDINARY_API_SECRET=";
    fs.writeFileSync(serverExample, template);
  }
}

console.log('\n🏁 Setup complete! Other devs just need to fill in their keys in server/.env.');
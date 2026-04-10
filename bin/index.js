#!/usr/bin/env node

import fs from "fs";
import path from "path";
import url from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// =======================
// Helper functions
// =======================
function runCommand(command, cwd) {
  execSync(command, { stdio: "inherit", cwd });
}

function copyTemplate(targetDir) {
  const templateDir = path.join(__dirname, "../template");
  fs.cpSync(templateDir, targetDir, { recursive: true });
}

function updatePackageJson(targetDir, projectName) {
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.name = projectName;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

function createFile(filePath, content) {
  fs.writeFileSync(filePath, content.trimStart());
}

// =======================
// Main script
// =======================
function main() {
  const projectName = process.argv[2] || "express-js-app";
  const targetDir =
    projectName === "." ? process.cwd() : path.join(process.cwd(), projectName);

  // ❌ Stop if folder already exists (except current directory)
  if (projectName !== "." && fs.existsSync(targetDir)) {
    console.error(`❌ Project "${projectName}" already exists at ${targetDir}`);
    process.exit(1);
  }

  // Copy template
  copyTemplate(targetDir);

  // Update package.json
  updatePackageJson(targetDir, projectName);

  console.log(`✅ Project created successfully at "${targetDir}" 🎉`);
  console.log("📦 Installing dependencies...");

  // Install runtime dependencies
  runCommand("npm install express@latest dotenv@latest", targetDir);

  // Install dev dependencies
  runCommand(
    "npm install -D ts-node-dev@latest typescript@latest eslint@9 @typescript-eslint/parser@latest @typescript-eslint/eslint-plugin@latest typescript-eslint@latest eslint-plugin-import@latest eslint-config-prettier@latest prettier@latest eslint-plugin-prettier@latest @types/express@latest @types/node@latest",
    targetDir
  );

  // Create .gitignore
  createFile(
    path.join(targetDir, ".gitignore"),
    `
# Node.js
node_modules
dist
.env

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode
.idea
`
  );

  // Create .env
  createFile(
    path.join(targetDir, ".env"),
    `
# Environment variables
PORT=5000
NODE_ENV=development
`
  );

  // Initialize Git
  console.log("Initializing git repository...");
  runCommand("git init", targetDir);
  runCommand("git add .", targetDir);
  runCommand('git commit -m "Initial commit"', targetDir);

  console.log("✨ Done!");
  console.log(`
Next steps:
  cd ${targetDir}
  npm run dev
Happy coding! 🚀
`);
}

main();

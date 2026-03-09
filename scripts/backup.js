/* This script creates a backup of the content directory */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function createBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
        const backupName = `backup-${timestamp}`;
        const backupPath = path.join("./backups/", backupName);

        // Create backups directory if it doesn't exist
        if (!fs.existsSync("./backups/")) {
            fs.mkdirSync("./backups/");
        }

        // Use rsync or cp to copy content
        execSync(`cp -r ./src/content ${backupPath}`, { stdio: "inherit" });

        console.log(`Backup created: ${backupPath}`);
    } catch (error) {
        console.error("Error creating backup:", error);
    }
}

createBackup();
/* This script cleans up draft posts */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const postsDir = "./src/content/posts/";
const draftsDir = "./src/content/drafts/";

async function cleanDrafts() {
    try {
        // Create drafts directory if it doesn't exist
        if (!fs.existsSync(draftsDir)) {
            fs.mkdirSync(draftsDir, { recursive: true });
        }

        const files = await glob("**/*.{md,mdx}", { cwd: postsDir });

        for (const file of files) {
            const fullPath = path.join(postsDir, file);
            const content = fs.readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");

            if (lines[0] === "---") {
                let endIndex = -1;
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i] === "---") {
                        endIndex = i;
                        break;
                    }
                }

                if (endIndex > 0) {
                    const frontmatter = lines.slice(1, endIndex).join("\n");
                    const draftMatch = frontmatter.match(/draft:\s*(true|false)/);

                    if (draftMatch && draftMatch[1] === "true") {
                        // Move draft to drafts directory
                        const draftPath = path.join(draftsDir, file);
                        const draftDir = path.dirname(draftPath);

                        if (!fs.existsSync(draftDir)) {
                            fs.mkdirSync(draftDir, { recursive: true });
                        }

                        fs.renameSync(fullPath, draftPath);
                        console.log(`Moved draft: ${file} to drafts/`);
                    }
                }
            }
        }

        console.log("Draft cleanup completed.");
    } catch (error) {
        console.error("Error cleaning drafts:", error);
    }
}

cleanDrafts();
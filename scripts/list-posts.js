/* This script lists all posts with their metadata */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const postsDir = "./src/content/posts/";

async function listPosts() {
    try {
        const files = await glob("**/*.{md,mdx}", { cwd: postsDir });

        console.log("Posts found:");
        console.log("=".repeat(50));

        for (const file of files) {
            const fullPath = path.join(postsDir, file);
            const content = fs.readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");

            // Extract frontmatter
            let title = "No title";
            let published = "No date";
            let category = "No category";
            let draft = false;

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
                    const titleMatch = frontmatter.match(/title:\s*(.+)/);
                    const publishedMatch = frontmatter.match(/published:\s*(.+)/);
                    const categoryMatch = frontmatter.match(/category:\s*(.+)/);
                    const draftMatch = frontmatter.match(/draft:\s*(true|false)/);

                    if (titleMatch) title = titleMatch[1].replace(/['"]/g, "").trim();
                    if (publishedMatch) published = publishedMatch[1].trim();
                    if (categoryMatch) category = categoryMatch[1].replace(/['"]/g, "").trim();
                    if (draftMatch) draft = draftMatch[1] === "true";
                }
            }

            console.log(`File: ${file}`);
            console.log(`Title: ${title}`);
            console.log(`Published: ${published}`);
            console.log(`Category: ${category}`);
            console.log(`Draft: ${draft}`);
            console.log("-".repeat(30));
        }
    } catch (error) {
        console.error("Error listing posts:", error);
    }
}

listPosts();
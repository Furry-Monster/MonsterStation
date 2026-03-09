/* This script generates site statistics */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const postsDir = "./src/content/posts/";

async function generateStats() {
    try {
        const files = await glob("**/*.{md,mdx}", { cwd: postsDir });

        let totalPosts = 0;
        let draftPosts = 0;
        const categories = new Map();
        const tags = new Set();
        const years = new Map();

        for (const file of files) {
            totalPosts++;
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

                    // Check if draft
                    const draftMatch = frontmatter.match(/draft:\s*(true|false)/);
                    if (draftMatch && draftMatch[1] === "true") {
                        draftPosts++;
                    }

                    // Extract category
                    const categoryMatch = frontmatter.match(/category:\s*(.+)/);
                    if (categoryMatch) {
                        const category = categoryMatch[1].replace(/['"]/g, "").trim();
                        categories.set(category, (categories.get(category) || 0) + 1);
                    }

                    // Extract tags
                    const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]*)\]/);
                    if (tagsMatch) {
                        const tagsList = tagsMatch[1].split(",").map(tag => tag.replace(/['"]/g, "").trim());
                        tagsList.forEach(tag => tags.add(tag));
                    }

                    // Extract year
                    const publishedMatch = frontmatter.match(/published:\s*(.+)/);
                    if (publishedMatch) {
                        const date = publishedMatch[1].trim();
                        const year = date.split("-")[0];
                        years.set(year, (years.get(year) || 0) + 1);
                    }
                }
            }
        }

        console.log("Site Statistics:");
        console.log("===============");
        console.log(`Total Posts: ${totalPosts}`);
        console.log(`Published Posts: ${totalPosts - draftPosts}`);
        console.log(`Draft Posts: ${draftPosts}`);
        console.log(`Categories: ${categories.size}`);
        console.log(`Tags: ${tags.size}`);
        console.log(`Years: ${years.size}`);

        console.log("\nCategories:");
        for (const [category, count] of categories) {
            console.log(`  ${category}: ${count}`);
        }

        console.log("\nPosts by Year:");
        for (const [year, count] of years) {
            console.log(`  ${year}: ${count}`);
        }

    } catch (error) {
        console.error("Error generating stats:", error);
    }
}

generateStats();
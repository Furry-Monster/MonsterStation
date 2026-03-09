/* This script updates frontmatter in posts */

import fs from "fs";
import path from "path";
import { glob } from "glob";

const postsDir = "./src/content/posts/";

async function updateFrontmatter(updateFn) {
    try {
        const files = await glob("**/*.{md,mdx}", { cwd: postsDir });

        for (const file of files) {
            const fullPath = path.join(postsDir, file);
            let content = fs.readFileSync(fullPath, "utf-8");
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
                    const body = lines.slice(endIndex + 1).join("\n");

                    const updatedFrontmatter = updateFn(frontmatter, file);

                    if (updatedFrontmatter !== frontmatter) {
                        content = `---\n${updatedFrontmatter}---\n${body}`;
                        fs.writeFileSync(fullPath, content);
                        console.log(`Updated: ${file}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error updating frontmatter:", error);
    }
}

// Example usage: Add lang field if missing
updateFrontmatter((frontmatter, file) => {
    if (!frontmatter.includes("lang:")) {
        return frontmatter + "\nlang: 'zh-CN'\n";
    }
    return frontmatter;
});
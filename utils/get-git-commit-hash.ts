import fs from "fs";
import path from "path";

export function getGitCommitHash(): string {
  try {
    const gitHeadPath = path.resolve(process.cwd(), ".git", "HEAD");
    const head = fs.readFileSync(gitHeadPath, "utf-8").trim();

    if (head.indexOf(":") === -1) {
      // We're in detached HEAD state, HEAD itself contains the commit hash
      return head.substring(0, 7);
    }

    const refPath = head.substring(5); // remove "ref: " prefix
    const gitRefPath = path.resolve(process.cwd(), ".git", refPath);
    const hash = fs.readFileSync(gitRefPath, "utf-8").trim();

    return hash.substring(0, 7); // Return first 7 characters of the hash
  } catch (error) {
    console.error("Failed to get Git commit hash:", error);
    return "dev";
  }
}

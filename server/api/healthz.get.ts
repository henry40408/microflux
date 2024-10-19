import { getGitCommitHash } from "~/utils/get-git-commit-hash";

export default defineEventHandler(async (_event) => {
  return { status: "OK", gitCommitHash: getGitCommitHash() };
});

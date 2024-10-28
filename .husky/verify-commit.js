const msg = require("fs").readFileSync(process.argv[2], "utf-8").trim();

const commitRE =
  /^(feat|fix|docs|style|refactor|perf|test|chore|revert|build)(\(.+\))?: .{1,50}/;

if (!commitRE.test(msg)) {
  console.log();
  console.error("Invalid commit message format.");
  console.error("Commit message should start with one of these prefixes:");
  console.error(
    "feat, fix, docs, style, refactor, perf, test, chore, revert, build"
  );
  console.error("For example: feat: add new feature");
  process.exit(1);
}

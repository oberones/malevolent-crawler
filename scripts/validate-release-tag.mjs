import { readFileSync } from "node:fs";

const version = JSON.parse(readFileSync("package.json", "utf8")).version;
const tag = process.argv[2];
if (
  !/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/.test(tag ?? "") ||
  tag?.includes("\n")
) {
  console.error(
    "Release tags must use stable X.Y.Z without a prefix or leading zeros.",
  );
  process.exitCode = 1;
} else if (tag !== version) {
  console.error("Release tag does not match package.json version.");
  process.exitCode = 1;
} else {
  console.log(`version=${version}`);
}

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const targetPath = resolve(
  scriptDirectory,
  "src",
  "components",
  "SubscriptionsTable.jsx",
);
const content = readFileSync(targetPath, "utf8");
const oldClassName =
  "className=\"rounded-lg p-2 text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta\"";
const newClassName =
  "className=\"flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta\"";

const oldCount = content.split(oldClassName).length - 1;
const newCount = content.split(newClassName).length - 1;

if (oldCount === 1) {
  writeFileSync(targetPath, content.replace(oldClassName, newClassName), "utf8");
  console.log("Updated the subscription actions button.");
} else if (oldCount === 0 && newCount === 1) {
  console.log("The subscription actions button is already updated.");
} else {
  throw new Error(
    `Expected one matching subscription actions button; found ${oldCount} old and ${newCount} updated.`,
  );
}

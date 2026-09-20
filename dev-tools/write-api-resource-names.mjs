import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const endpointsDir = join(rootDir, "src/service-api/generated/endpoints");
const outputPath = join(rootDir, "src/service-api/generated/api-resource-names.ts");

async function readResourceNames() {
  try {
    const entries = await readdir(endpointsDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

const resourceNames = await readResourceNames();
const fileContents = [
  `export const allApiResourceNames = ${JSON.stringify(resourceNames)} as const;`,
  "",
  "export type AllApiResourceName = (typeof allApiResourceNames)[number];",
  "",
].join("\n");

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, fileContents);

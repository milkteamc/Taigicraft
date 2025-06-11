import { Client } from "@gradio/client";

try {
  await Deno.mkdir("data");
  await Deno.mkdir("output");
  // deno-lint-ignore no-empty
} catch (_) {}
let oldExists = true;
let translatedExists = true;
try {
  await Deno.lstat("data/zh_tw.json");
} catch (err) {
  oldExists = false;
  if (!(err instanceof Deno.errors.NotFound)) {
    throw err;
  }
  await Deno.create("data/zh_tw.json");
}
try {
  await Deno.lstat("data/translated.txt");
} catch (err) {
  translatedExists = false;
  if (!(err instanceof Deno.errors.NotFound)) {
    throw err;
  }
  await Deno.create("data/translated.txt");
}
const app = await Client.connect("https://mute-rice-9103.maoyue.workers.dev/");
const translated = JSON.parse(
  translatedExists ? await Deno.readTextFile("data/translated.txt") : "{\n}"
);
const oldFile = oldExists ? await Deno.readTextFile("data/zh_tw.json") : "{\n}";
const newFile = await (
  await fetch(
    "https://assets.mcasset.cloud/latest/assets/minecraft/lang/zh_tw.json"
  )
).text();
if (oldFile == newFile) {
  console.log("No updates, exiting...");
  Deno.exit(0);
}
await Deno.writeTextFile("data/zh_tw.json", newFile);
const oldFileLines = oldFile.split("\n");
const newFileLines = newFile.split("\n");
const newLines = newFileLines.filter((x) => !oldFileLines.includes(x));

const totalItems = newLines.length;
let processedItems = 0;

for await (const line of newLines) {
  processedItems++;
  const progressPercentage = Math.floor((processedItems / totalItems) * 100);

  const processedLine = line.endsWith(",")
    ? line.trim().slice(0, -1)
    : line.trim();
  const obj = JSON.parse(`{${processedLine}}`);
  const key = Object.keys(obj)[0];
  const value = obj[key];

  console.log(
    `[${processedItems}/${totalItems} ${progressPercentage}%] Translating ${value} (${key})...`
  );

  let response = await app.predict("/predict", [[], value, "taigi_zh_tw"]);
  let responseData = response.data as string[];
  console.log(`Result: ${responseData[0]}`);
  let translatedValue = responseData[0].replaceAll("\n", "\\n");
  const run = async () => {
    if (translatedValue.includes("請求過於頻繁，請稍候再試。")) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      response = await app.predict("/predict", [[], value, "taigi_zh_tw"]);
      responseData = response.data as string[];
      console.log(`Result: ${responseData[0]}`);
      translatedValue = responseData[0]
        .replaceAll("\\", "\\\\")
        .replaceAll("\n", "\\n")
        .replaceAll('"', '\\"');
      if (translatedValue.includes("請求過於頻繁，請稍候再試。")) await run();
    } else {
      translated[key] = translatedValue;
      await Deno.writeTextFile(
        "data/translated.txt",
        JSON.stringify(translated, null, 2),
      );
    }
  };
  await run();
}
console.log(`[${totalItems}/${totalItems} 100%] Translation complete.`);

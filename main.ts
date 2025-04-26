import { Client } from "@gradio/client";

try {
  await Deno.mkdir("data");
  await Deno.mkdir("output");
  await Deno.create("output/nan.json");
  // deno-lint-ignore no-empty
} catch (_) {}
let oldExists = true;
try {
  await Deno.lstat("data/zh_tw.json");
} catch (err) {
  oldExists = false;
  if (!(err instanceof Deno.errors.NotFound)) {
    throw err;
  }
  await Deno.create("data/zh_tw.json");
}
const app = await Client.connect("http://tts001.iptcloud.net:8802/");
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
const outputLines = [];
for await (const line of newLines) {
  const processedLine = line.endsWith(",")
    ? line.trim().slice(0, -1)
    : line.trim();
  const obj = JSON.parse(`{${processedLine}}`);
  const key = Object.keys(obj)[0];
  const value = obj[key];
  console.log(`Translating ${value} (${key})...`);
  const response = await app.predict("/predict", [[], value, "taigi_zh_tw"]);
  const responseData = response.data as string[];
  console.log(`Result: ${responseData[0]}`);
  const translatedValue = responseData[0];
  await Deno.writeTextFile(
    "data/translated.txt",
    `"${key}":"${translatedValue}",`,
    { append: true }
  );
  outputLines.push(`"${key}":"${translatedValue}",`);
}
await Deno.writeTextFile("data/nan.json", `{${outputLines.join("\n")}}`);

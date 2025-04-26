let oldExists = true;
try {
  await Deno.lstat("data/zh_tw.json");
} catch (err) {
  oldExists = false;
  if (!(err instanceof Deno.errors.NotFound)) {
    throw err;
  }
  await Deno.mkdir("data");
  await Deno.create("data/zh_tw.json");
}
const oldFile = oldExists ? await Deno.readTextFile("data/zh_tw.json") : "{}";
const currentFile = await(
  await fetch(
    "https://assets.mcasset.cloud/latest/assets/minecraft/lang/zh_tw.json"
  )
).text();
if (oldFile == currentFile) {
  console.log("No updates, exiting...");
  Deno.exit(0);
}
await Deno.writeTextFile("data/zh_tw.json", currentFile);

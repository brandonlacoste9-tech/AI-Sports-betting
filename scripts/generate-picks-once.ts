import { generateAndStorePicks } from "../src/lib/ai/generate-picks.ts";

generateAndStorePicks({ regenerate: true })
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

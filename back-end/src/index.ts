import { Article } from "./Article";
import { getNewDataSource } from "./config/database";

async function main() {
  const dataSource = await getNewDataSource("./sqlite.db");
  console.log("💾 Successfully connected to database.");

  await Article.createBaseArticles();
  console.log("Successfully created articles.");

  // start HTTP server…
  console.log("🚀 Server listening on port xxxx.");
}

main();

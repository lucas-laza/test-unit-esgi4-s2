import express from "express";
import { Article } from "./Article";
import { getNewDataSource } from "./config/database";
import { Order } from "./Order";

const app = express();
const port = 3030; // Remplacez xxxx par le port sur lequel vous souhaitez que votre serveur écoute

app.use(express.json());

// Middleware pour ajouter les en-têtes CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Autorise les requêtes de n'importe quelle origine
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Autorise les méthodes de requête spécifiées
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Autorise les en-têtes spécifiés
  next();
});

app.get("/api/articles", async (req, res) => {
  try {
    let articles: any[] = []; // Initialise articles avec un tableau vide
    // const articles = await Article.getAll(); // Supposons que vous avez une méthode statique dans votre modèle Article pour récupérer tous les articles
    res.json({ articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.getOrders();
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/api/orders/:id/submit", async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await Order.findOneOrFail({ where: { id: orderId }, relations: ["articlesInOrder", "articlesInOrder.article"] });

    await order.submitOrder();
    res.json(order);
  } catch (error) {
    console.error(error);

    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/orders/submitted", async (req, res) => {
  try {
    const submittedOrders = await Order.getSubmittedOrders();
    res.json(submittedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

async function main() {
  const dataSource = await getNewDataSource("./sqlite.db");
  console.log("💾 Successfully connected to database.");

  await Article.createBaseArticles();
  console.log("Successfully created articles.");

  await Order.createBaseOrders();
  console.log("Successfully created orders.");

  app.listen(port, () => {
    console.log(`🚀 Server listening on port ${port}.`);
  });
}

main();

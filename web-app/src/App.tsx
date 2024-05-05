import React, { useEffect, useState } from "react";
import "./App.css";
import { sendGetRequest } from "./lib/http";

type Article = {
  id: string;
  name: string;
  priceEur: number;
};

function App() {
  const [articles, setArticles] = useState<
    (Article & { quantity: number })[] | null
  >(null);

  const fetchArticles = async () => {
    const { articles: fetchedArticles } = await sendGetRequest("/api/articles");
    setArticles(
      (fetchedArticles as Article[]).map((article) => ({
        ...article,
        quantity: 0,
      }))
    );
  };

  const setArticleQuantity = (id: string, quantity: number) => {
    if (articles) {
      setArticles(
        articles?.map((article) =>
          article.id === id ? { ...article, quantity } : article
        )
      );
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {articles ? (
          <ul>
            {articles.map((article) => (
              <li key={article.id}>
                <span>{article.name}</span>
                <button
                  onClick={() => {
                    setArticleQuantity(article.id, article.quantity - 1);
                  }}
                >
                  -
                </button>
                {article.quantity}
                <button
                  onClick={() => {
                    setArticleQuantity(article.id, article.quantity + 1);
                  }}
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        ) : (
          "Chargement…"
        )}
      </header>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import "./App.css";
import { sendGetRequest } from "./lib/http";
import { Article } from "./types";


function ArticlePage() {
  const [articles, setArticles] = useState<(Article & { quantity: number })[] | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      const response: Record<string, unknown> = await sendGetRequest("/api/articles");
      if ('articles' in response && Array.isArray(response.articles)) {
        const { articles } = response as { articles: Article[] };
        setArticles(
          articles.map((article: Article) => ({
            ...article,
            quantity: 0,
          }))
        );
      } else {
        // Gérer le cas où la propriété articles est manquante ou non un tableau
        console.error("Erreur: La réponse de l'API est invalide");
      }
    };
    
    
    
    fetchArticles();
  }, []);

  const setArticleQuantity = (id: string, quantity: number) => {
    if (articles) {
      setArticles(
        articles.map((article) =>
          article.id === id ? { ...article, quantity } : article
        )
      );
    }
  };

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

export default ArticlePage;

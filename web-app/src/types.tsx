export type Article = {
  id: string;
  name: string;
  priceEurCent: number;
  weightG: number;
  specialShippingCostEurCent: number | null;
};

export type ArticleInOrder = {
  id: string;
  quantity: number;
  article: Article;
};

export type Order = {
  id: string;
  submitted: boolean;
  submittedAt: string;
  articlesInOrder: ArticleInOrder[];
};

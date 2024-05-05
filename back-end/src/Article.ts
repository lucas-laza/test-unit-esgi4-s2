import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ArticleInOrder } from "./ArticleInOrder";

const BASE_ARTICLES = [
  {
    name: "Câble HDMI",
    priceEurCent: 2000,
    weightG: 100,
  },
  {
    name: "Cuisse de poulet",
    priceEurCent: 1000,
    weightG: 150,
    specialShippingCostEurCent: 400,
  },
  {
    name: "Couscous au poisson",
    priceEurCent: 1200,
    weightG: 220
  },
  {
    name: "Nems au poulet",
    priceEurCent: 1000,
    weightG: 150,
  },
  {
    name: "ChatTGP",
    priceEurCent: 10000,
    weightG: 1500,
    specialShippingCostEurCent: 3000,
  },
  {
    name: "Chien: Teckel",
    priceEurCent: 1000,
    weightG: 5000,
    specialShippingCostEurCent: 40000,
  },
];

@Entity()
export class Article extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "integer" })
  priceEurCent!: number;

  @Column({ type: "integer" })
  weightG!: number;

  @Column({ type: "integer", nullable: true })
  specialShippingCostEurCent!: number | null;

  @OneToMany(() => ArticleInOrder, (articleInOrder) => articleInOrder.article)
  ordersWithArticle!: ArticleInOrder[];

  static async createBaseArticles() {
    for (const baseArticle of BASE_ARTICLES) {
      // Vérifier si un article avec le même nom existe déjà
      const existingArticle = await Article.findOne({ where: { name: baseArticle.name } });
  
      if (!existingArticle) {
        const article = new Article();
        article.name = baseArticle.name;
        article.priceEurCent = baseArticle.priceEurCent;
        article.weightG = baseArticle.weightG;
        article.specialShippingCostEurCent = baseArticle.specialShippingCostEurCent ?? null;
  
        await article.save();
      } else {
        console.log(`Article with name ${baseArticle.name} already exists. Skipping creation.`);
      }
    }
  }  
}

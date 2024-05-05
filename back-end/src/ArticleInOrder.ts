import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./Article";
import { Order } from "./Order";

@Entity()
export class ArticleInOrder extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Order, (order) => order.articlesInOrder)
  order!: Order;

  @ManyToOne(() => Article, (article) => article.ordersWithArticle, {
    eager: true,
  })
  article!: Article;

  @Column()
  quantity!: number;
}

import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { sendEmail } from "./lib/email";
import { Article } from "./Article";
import { ArticleInOrder } from "./ArticleInOrder";

const BASE_ORDERS = [
  [2, 1],   // Quantities for the first set of articles
  [2, 1, 3, 2, 1, 1],  // Quantities for the second set of articles
  [3, 2],   // Quantities for the third set of articles
  [1, 1]    // Quantities for the fourth set of articles
];


@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToMany(() => ArticleInOrder, (articleInOrder) => articleInOrder.order, {
    eager: true,
  })
  articlesInOrder!: ArticleInOrder[];

  @Column({ default: false })
  submitted!: boolean;

  @Column({ type: "date", nullable: true })
  submittedAt!: Date;

  static async getOneOrder(orderId: string): Promise<Order | null> {
    const order = await Order.findOne({
      where: { id: orderId },
      relations: ['articlesInOrder', 'articlesInOrder.article'],
    });
    return order;
  }

  static async getOrders(): Promise<Order[]> {
    const orders = Order.find({ relations: ["articlesInOrder", "articlesInOrder.article"] });
    return orders;
  }

  static async getSubmittedOrders(): Promise<Order[]> {
    const submittedOrders = Order.find({
      where: { submitted: true },
      relations: ["articlesInOrder", "articlesInOrder.article"],
    });
    return submittedOrders;
  }

  static async createBaseOrders(): Promise<void> {
    // Fetch all articles from the database
    const articles = await Article.find();
    
    // Create orders using articles and their quantities
    for (let i = 0; i < BASE_ORDERS.length; i++) {
      const orderData = BASE_ORDERS[i].map((quantity, index) => {
        return { articleId: articles[index].id, quantity: quantity };
      });
      
      const order = await Order.createOrder(orderData);
      console.log("Order created with ID:", order.id);
    }
  }

  static async createOrder(
    articlesInOrder: { articleId: string; quantity: number }[]
  ): Promise<Order> {
    for (const { articleId } of articlesInOrder) {
      const article = await Article.findOne({ where: { id: articleId } });
      if (!article) {
        throw new Error(`Article with ID ${articleId} not found.`);
      }
    }

    const order = Order.create();
    await order.save();

    for (const { articleId, quantity } of articlesInOrder) {
      const article = await Article.findOneOrFail({ where: { id: articleId } });
      const articleInOrder = ArticleInOrder.create();
      articleInOrder.order = order;
      articleInOrder.article = article;
      articleInOrder.quantity = quantity;
      await articleInOrder.save();
    }

    await order.reload();
    return order;
  }

  async submitOrder() {
    if (this.submitted) {
      throw new Error("Order has already been submitted.");
    }
    this.submitted = true;
    this.submittedAt = new Date();
    await this.save();
    sendEmail();
  }

  private getTotalPrice(): number {
    return this.articlesInOrder.reduce(
      (total, { article, quantity }) => total + article.priceEurCent * quantity,
      0
    );
  }

  getShippingCost(): number {
    return this.getTotalPrice() >= 10000
      ? 0
      : this.articlesInOrder.reduce(
          (total, { article, quantity }) =>
            total +
            (article.specialShippingCostEurCent || article.weightG ) * quantity,
          0
        );
  }

  getOrderCost(): {
    totalWithoutShipping: number;
    shipping: number;
    totalWithShipping: number;
  } {
    const totalWithoutShipping = this.getTotalPrice();
    const shipping = this.getShippingCost();

    return {
      totalWithoutShipping,
      shipping,
      totalWithShipping: totalWithoutShipping + shipping,
    };
  }

  async deleteOrder() {
    await Order.delete({ id: this.id });
  }
}

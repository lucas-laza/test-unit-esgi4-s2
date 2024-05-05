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
  [
    { articleId: "4b11077f-53b4-4fbf-91c6-d194762856cb", quantity: 2 },
    { articleId: "a4eb922c-ef0f-450e-87f0-de2efdc69373", quantity: 1 },
  ],
  [
    { articleId: "4b11077f-53b4-4fbf-91c6-d194762856cb", quantity: 2 },
    { articleId: "a4eb922c-ef0f-450e-87f0-de2efdc69373", quantity: 1 },
    { articleId: "cf8cea20-9b2b-4ffa-b184-ecf002daae8e", quantity: 3 },
    { articleId: "f3ed3600-8689-416c-a554-ee669e0f5604", quantity: 2 },
    { articleId: "289fd9bc-2485-46b2-a2cb-090f2c26971d", quantity: 1 },
    { articleId: "809b0d0a-f079-4a94-99f5-319e42f3e2d7", quantity: 1 },
  ],
  [
    { articleId: "cf8cea20-9b2b-4ffa-b184-ecf002daae8e", quantity: 3 },
    { articleId: "f3ed3600-8689-416c-a554-ee669e0f5604", quantity: 2 },
  ],
  [
    { articleId: "289fd9bc-2485-46b2-a2cb-090f2c26971d", quantity: 1 },
    { articleId: "809b0d0a-f079-4a94-99f5-319e42f3e2d7", quantity: 1 },
  ],
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

  
    // Création de chaque commande avec les articles et quantités correspondantes
    for (const orderData of BASE_ORDERS) {
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

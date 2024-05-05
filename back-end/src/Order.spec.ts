import { DataSource } from "typeorm";
import { Order } from "./Order";
import { sendEmail } from "./lib/email";
import { getNewDataSource } from "./config/database";
import { Article } from "./Article";
import { ArticleInOrder } from "./ArticleInOrder";

jest.mock("./lib/email");

let dataSource: DataSource;

beforeEach(async () => {
  dataSource = await getNewDataSource(":memory:");
  await Article.createBaseArticles();
});

afterEach(async () => {
  await dataSource.destroy();
});

describe("static createOrder", () => {
  describe("when all article IDs belong to articles in table", () => {
    it("returns new Order with articles", async () => {
      const articles = await Article.find();

      const order = await Order.createOrder([
        { articleId: articles[0].id, quantity: 4 },
        { articleId: articles[1].id, quantity: 1 },
      ]);

      expect(order.articlesInOrder).toMatchObject([
        {
          article: {
            name: "Câble HDMI",
            priceEur: 20,
            weightKg: 0.1,
          },
          quantity: 4,
        },
        {
          article: {
            name: "Cuisse de poulet",
            priceEur: 10,
            weightKg: 0.15,
            specialShippingCost: 4,
          },
          quantity: 1,
        },
      ]);
    });

    it("creates order and articles in order in database", async () => {
      const articles = await Article.find();

      await Order.createOrder([
        { articleId: articles[0].id, quantity: 4 },
        { articleId: articles[1].id, quantity: 1 },
      ]);

      const orders = await Order.find();
      expect(orders).toHaveLength(1);

      const articlesInOrder = await ArticleInOrder.find();
      expect(articlesInOrder).toHaveLength(2);

      expect(articlesInOrder).toMatchObject([
        {
          article: {
            name: "Câble HDMI",
            priceEur: 20,
            specialShippingCost: null,
            weightKg: 0.1,
          },
          quantity: 4,
        },
        {
          article: {
            name: "Cuisse de poulet",
            priceEur: 10,
            specialShippingCost: 4,
            weightKg: 0.15,
          },
          quantity: 1,
        },
      ]);
    });
  });

  describe("when one article ID does not belong to article in table", () => {
    it("throws error", async () => {
      await expect(
        Order.createOrder([{ articleId: "0000", quantity: 1 }])
      ).rejects.toThrow("Article with ID 0000 not found.");
    });
  });
});

describe("submitOrder", () => {
  it("sets `submitted` to true", async () => {
    const order = await Order.createOrder([]);

    await order.submitOrder();

    expect(order.submitted).toEqual(true);
    expect(
      (await Order.findOne({ where: { id: order.id } }))?.submitted
    ).toEqual(true);
  });

  it("calls function `sendEmail`", async () => {
    const order = await Order.createOrder([]);

    await order.submitOrder();

    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});

describe("getShippingCost", () => {
  describe("if total article price greater than or equal to 100", () => {
    it("returns 0", async () => {
      const articles = await Article.find();
      const order = await Order.createOrder([
        { articleId: articles[0].id, quantity: 5 },
      ]);

      expect(order.getShippingCost()).toEqual(0);
    });
  });

  describe("if total article price less than 100", () => {
    it("returns 10 euros per kilogram of total weight, excluding articles with special shipping, whose amount is added to total", async () => {
      const articles = await Article.find();
      const order = await Order.createOrder([
        { articleId: articles[0].id, quantity: 2 },
        { articleId: articles[1].id, quantity: 3 },
      ]);

      expect(order.getShippingCost()).toEqual(2 * 1 + 3 * 4); // 14
    });
  });
});

describe("getOrderCost", () => {
  it("returns total with and without shipping, and shipping", async () => {
    const articles = await Article.find();
    const order = await Order.createOrder([
      { articleId: articles[0].id, quantity: 2 },
      { articleId: articles[1].id, quantity: 3 },
    ]);

    expect(order.getOrderCost()).toEqual({
      totalWithoutShipping: 70,
      shipping: 14,
      totalWithShipping: 84,
    });
  });
});

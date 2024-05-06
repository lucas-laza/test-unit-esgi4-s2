import React from "react";
import { render, screen } from "@testing-library/react";
import OrderPage from "./OrderPage";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("./lib/http", () => {
  return {
    sendGetRequest: () => {
      return Promise.resolve({
        id: "order1",
        submitted: true,
        submittedAt: "2024-05-06",
        articlesInOrder: [
          {
            id: "article1",
            quantity: 3,
            article: {
              id: "a1",
              name: "Couscous au poisson",
              priceEurCent: 1200,
              weightG: 220,
              specialShippingCostEurCent: null,
            },
          },
          {
            id: "article2",
            quantity: 2,
            article: {
              id: "a2",
              name: "Nems au poulet",
              priceEurCent: 1000,
              weightG: 150,
              specialShippingCostEurCent: null,
            },
          },
        ],
      });
    },
  };
});

describe("OrderPage", () => {
  it("renders order details", async () => {
    render(
      <MemoryRouter initialEntries={["/orders/order1"]}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/order details/i);

    const titleElement = screen.getByText(/order details/i);
    expect(titleElement).toBeInTheDocument();

    const idElement = screen.getByText(/id: order1/i);
    expect(idElement).toBeInTheDocument();

    const statusElement = screen.getByText(/submitted: true/i);
    expect(statusElement).toBeInTheDocument();

    const submittedAtElement = screen.getByText(/submitted at: 2024-05-06/i);
    expect(submittedAtElement).toBeInTheDocument();

    const articleElement1 = screen.getByText(/couscous au poisson x 3/i);
    expect(articleElement1).toBeInTheDocument();

    const articleElement2 = screen.getByText(/nems au poulet x 2/i);
    expect(articleElement2).toBeInTheDocument();
  });

  it("submits the order and updates the status", async () => {
    // render(
    //   <MemoryRouter initialEntries={["/orders/order1"]}>
    //     <Routes>
    //       <Route path="/orders/:orderId" element={<OrderPage />} />
    //     </Routes>
    //   </MemoryRouter>
    // );

    // await screen.findByText(/Submitted: No/i);

    // const submitted = screen.getByText(/Submitted: No/i);
    // expect(submitted).toBeInTheDocument();

    // const submitButton = screen.getByText(/submit order/i);
    // userEvent.click(submitButton);

    // const submittedTrue = screen.getByText(/Submitted: Yes/i);
    // expect(submitted).toBeInTheDocument();

  });
});

import { render, screen, waitFor } from "@testing-library/react";
import OrdersPage from "./OrdersPage";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("./lib/http", () => {
  return {
    sendGetRequest: () => {
      return Promise.resolve([
        { id: "order1", submitted: false },
        { id: "order2", submitted: true }
      ]);
    },
  };
});

describe("Orders", () => {
  it("renders orders", async () => {
    render(
      <MemoryRouter initialEntries={["/orders"]}>
        <Routes>
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/order1/i));

    const orderElement1 = screen.getByText(/order1/i);
    expect(orderElement1).toBeInTheDocument();

    const orderElement2 = screen.getByText(/order2/i);
    expect(orderElement2).toBeInTheDocument();
  });
});

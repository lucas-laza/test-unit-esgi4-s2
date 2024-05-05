import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

jest.mock("./lib/http", () => {
  return {
    sendGetRequest: () => {
      return {
        articles: [
          { id: "1234", name: "Chaise", priceEur: 50 },
          { id: "5678", name: "Table", priceEur: 150 },
        ],
      };
    },
  };
});

describe("App", () => {
  it("renders loading status first and articles after fetching data", async () => {
    render(<App />);

    const loadingElement = screen.getByText(/Chargement…/i);
    expect(loadingElement).toBeInTheDocument();

    let articleElements: HTMLElement[];
    await waitFor(() => {
      articleElements = screen.getAllByRole("listitem");
      expect(articleElements).toHaveLength(2);
    });

    await waitFor(() => {
      expect(articleElements[0].textContent).toMatch("Chaise");
    });

    await waitFor(() => {
      expect(articleElements[0].textContent).toMatch("0");
    });

    await waitFor(() => {
      const buttons = within(articleElements[0]).getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });

    await waitFor(() => {
      expect(articleElements[0].textContent).toMatch("-");
    });

    await waitFor(() => {
      expect(articleElements[0].textContent).toMatch("+");
    });
  });

  describe("when button + is clicked", () => {
    it("increments count", async () => {
      render(<App />);

      let articleElements: HTMLElement[];
      await waitFor(() => {
        articleElements = screen.getAllByRole("listitem");
        const buttonPlus = within(articleElements[0]).getByText("+");

        buttonPlus.click();
        expect(articleElements[0].textContent).toMatch("1");
      });

      await waitFor(() => {
        expect(articleElements[1].textContent).toMatch("0");
      });
    });
  });
});

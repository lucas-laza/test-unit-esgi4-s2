import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { sendGetRequest, sendPutRequest } from './lib/http';
import { Order } from './types';

const OrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const initialOrder = location.state?.order as Order | undefined;
  const [order, setOrder] = useState<Order | undefined>(initialOrder);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const fetchOrder = async (orderId: string) => {
    const response = await sendGetRequest(`/api/orders/${orderId}`);
    setOrder(response as Order);
  };

  const convertCentsToEuros = (cents: number): number => {
    return cents / 100;
  };

  const getTotalPrice = (): number => {
    if (!order) {
      return 0;
    }
    return order.articlesInOrder.reduce((total, articleInOrder) => {
      return total + articleInOrder.quantity * articleInOrder.article.priceEurCent;
    }, 0);
  };

  const getTotalShippingCost = (): number => {
    if (!order) {
      return 0;
    }
    return order.articlesInOrder.reduce((total, articleInOrder) => {
      if (articleInOrder.article.specialShippingCostEurCent !== null) {
        return total + articleInOrder.quantity * articleInOrder.article.specialShippingCostEurCent;
      } else {
        return total;
      }
    }, 0);
  };

  const handleSubmit = async () => {
    if (order) {
      await sendPutRequest(`/api/orders/${order.id}/submit`);
      setShouldRefetch(true);
    }
  };

  useEffect(() => {
    if (id && (shouldRefetch || !order)) {
      fetchOrder(id);
      setShouldRefetch(false);
    }
  }, [id, shouldRefetch, order]);

  if (!order) {
    return <p>Order not found</p>;
  }

  return (
    <div>
      <h1>Order Details</h1>
      <p>ID: {order.id}</p>
      <p>Submitted: {order.submitted ? 'Yes' : 'No'}</p>
      {!order.submitted && (
        <button onClick={handleSubmit}>Submit Order</button>
      )}

      {order.submittedAt !== null ? (
        <p>Submitted At: {order.submittedAt}</p>
      ) : null}

      <h2>Articles in Order</h2>
      <ul>
        {order.articlesInOrder.map((articleInOrder) => (
          <li key={articleInOrder.id}>
            <p>Article ID: {articleInOrder.article.id}</p>
            <p>Article Name: {articleInOrder.article.name}</p>
            <p>Quantity: {articleInOrder.quantity}</p>
            <p>Price: {convertCentsToEuros(articleInOrder.quantity * articleInOrder.article.priceEurCent)} €</p>
            {articleInOrder.article.specialShippingCostEurCent !== null && (
              <p>ShippingCost: {convertCentsToEuros(articleInOrder.article.specialShippingCostEurCent)} €</p>
            )}
          </li>
        ))}
      </ul>
      <p>Total Price: {convertCentsToEuros(getTotalPrice())} €</p>
      <p>ShippingCostTotal: {convertCentsToEuros(getTotalShippingCost())} €</p>
    </div>
  );
};

export default OrderPage;

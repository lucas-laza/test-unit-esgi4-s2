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
      <p>Submitted At: {order.submittedAt}</p>
      <h2>Articles in Order</h2>
      <ul>
        {order.articlesInOrder.map((articleInOrder) => (
          <li key={articleInOrder.id}>
            <p>Article ID: {articleInOrder.article.id}</p>
            <p>Article Name: {articleInOrder.article.name}</p>
            <p>Quantity: {articleInOrder.quantity}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderPage;

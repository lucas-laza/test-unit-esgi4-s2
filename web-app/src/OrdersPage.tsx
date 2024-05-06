import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendGetRequest } from './lib/http';
import { Order } from './types';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await sendGetRequest("/api/orders");
      if (Array.isArray(response)) {
        console.log(response);
        setOrders(response);
      } else {
        // Handle the case where the response is not an array
        console.error("Error: The API response is invalid");
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h1>Orders</h1>
      {orders ? (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <Link to={`/orders/${order.id}`}>
                {order.id}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading orders...</p>
      )}
    </div>
  );
};

export default OrdersPage;

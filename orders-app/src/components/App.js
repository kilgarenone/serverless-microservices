import { h, Component } from "preact";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { v4 as uuid } from "uuid";

const ORDER_STATES = {
  0: { desc: "Created", bgColor: "yellow" },
  200: { desc: "Confirmed", bgColor: "lightgreen" },
  201: { desc: "Delivered", bgColor: "cyan" },
  400: { desc: "Canceled", bgColor: "lightgrey" },
  1: { desc: "Delivered", bgColor: "green" },
};

class Order extends Component {
  cancelOrder = async () => {
    await fetch(process.env.ORDERS_ENDPOINT, {
      method: "PUT",
      body: JSON.stringify({ orderId: this.props.details.orderId }),
    }).then((res) => res.json());
  };

  render({ details: { itemName, skuId, qty, createdAt, status } }) {
    console.log("status:", status);
    return (
      <tr>
        <td>{itemName}</td>
        <td>{skuId}</td>
        <td>{qty}</td>
        <td style={{ backgroundColor: ORDER_STATES[status].bgColor }}>
          {ORDER_STATES[status].desc}
        </td>
        <td>{new Date(createdAt).toLocaleString()}</td>
        <td>
          {status == 200 && <button onClick={this.cancelOrder}>Cancel</button>}
        </td>
      </tr>
    );
  }
}

export class App extends Component {
  isCreatingOrder = false;

  state = {
    orderId: "",
    itemName: "",
    skuId: "",
    qty: 0,
    orders: [],
    createdAt: null,
    status: 0,
  };

  async componentDidMount() {
    this.websocket = new WebSocket(process.env.SERVERLESS_WEBSOCKET_ENDPOINT);
    this.websocket.onopen = () => {
      console.log("hello client socket");
    };

    this.websocket.onmessage = ({ data: d }) => {
      const data = JSON.parse(d);
      console.log("data:", data);

      if (!data.orderId) return;

      const orderId = data.orderId.S;
      const orders = [...this.state.orders];
      const orderIndex = orders.findIndex((order) => order.orderId === orderId);

      if (orderIndex < 0) return;

      orders[orderIndex].status = data.status.N;

      this.setState({ orders });
    };

    const orders = await fetch(process.env.ORDERS_ENDPOINT).then((res) =>
      res.json()
    );

    this.setState({ orders });
  }

  createOrder = () => {
    this.isCreatingOrder = true;

    this.setState({
      orderId: uuid(),
      itemName: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      }),
      skuId: Math.random().toString(36).substring(7),
      qty: Math.floor(Math.random() * 10 + 1),
      createdAt: new Date().toISOString(),
      status: 0,
    });
  };

  submitOrder = async () => {
    const { orders, ...orderDetails } = this.state;

    this.setState((prevState) => ({
      orders: [{ ...orderDetails }].concat(prevState.orders),
    }));

    this.createOrder();

    await fetch(process.env.ORDERS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(orderDetails),
    }).then((res) => res.json());
  };

  render(_, { itemName, skuId, qty, orders }) {
    return (
      <div>
        <button onClick={this.createOrder}>Create order</button>
        {this.isCreatingOrder && (
          <div>
            <div>
              <strong>Item:</strong> {itemName}
            </div>
            <div>
              <strong>SKU:</strong> {skuId}
            </div>
            <div>
              <strong>Quantity:</strong> {qty}
            </div>
            <button onClick={this.submitOrder}>Submit order</button>
          </div>
        )}
        <table>
          <tr>
            <th>Item</th>
            <th>SKU</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Created at</th>
            <th>Actions</th>
          </tr>
          {!!orders.length &&
            orders.map((order) => (
              <Order key={order.orderId} details={order} />
            ))}
        </table>
      </div>
    );
  }
}

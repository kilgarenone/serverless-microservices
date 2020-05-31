import { h, Component } from "preact";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { v4 as uuid } from "uuid";

const ORDER_STATE = {
  0: { desc: "Created", bgColor: "yellow" },
  200: { desc: "Confirmed", bgColor: "lightgreen" },
  400: { desc: "Canceled", bgColor: "lightgrey" },
  1: { desc: "Delivered", bgColor: "green" },
};

function Order({ details: { itemName, skuId, qty, createdAt, status } }) {
  return (
    <tr>
      <td>{itemName}</td>
      <td>{skuId}</td>
      <td>{qty}</td>
      <td style={{ backgroundColor: ORDER_STATE[status].bgColor }}>
        {ORDER_STATE[status].desc}
      </td>
      <td>{new Date(createdAt).toLocaleString()}</td>
    </tr>
  );
}

// eslint-disable-next-line import/prefer-default-export
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

    this.websocket.onmessage = ({ data }) => {
      console.log("serverless websocket data:", JSON.parse(data));
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

    await fetch(process.env.ORDERS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(orderDetails),
    }).then((res) => res.json());

    this.setState((prevState) => ({
      orders: [{ ...orderDetails }].concat(prevState.orders),
    }));

    this.createOrder();
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

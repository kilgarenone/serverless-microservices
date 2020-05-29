import { h, Component } from "preact";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

const ORDER_STATE = {
  0: { desc: "Created", bgColor: "yellow" },
  200: { desc: "Confirmed", bgColor: "lightgreen" },
  400: { desc: "Canceled", bgColor: "lightgrey" },
  1: { desc: "Delivered", bgColor: "green" },
};

class Order extends Component {
  constructor(props) {
    super(props);

    this.state = { orderStatus: props.details.status };
  }

  async componentDidMount() {
    if (!this.props.details.newOrder) return;

    const {
      details: { newOrder, ...orderDetails },
    } = this.props;

    const { paymentStatus } = await fetch(process.env.ORDERS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(orderDetails),
    }).then((res) => res.json());

    this.setState({ orderStatus: paymentStatus });
  }

  render({ details: { itemName, skuId, qty, timeStamp } }, { orderStatus }) {
    return (
      <tr>
        <td>{itemName}</td>
        <td>{skuId}</td>
        <td>{qty}</td>
        <td style={{ backgroundColor: ORDER_STATE[orderStatus].bgColor }}>
          {ORDER_STATE[orderStatus].desc}
        </td>
        <td>{new Date(timeStamp).toLocaleString()}</td>
      </tr>
    );
  }
}
// eslint-disable-next-line import/prefer-default-export
export class App extends Component {
  isCreatingOrder = false;

  state = {
    itemName: "",
    skuId: "",
    qty: 0,
    orders: [],
    timeStamp: null,
    status: 0,
  };

  async componentDidMount() {
    const { Items } = await fetch(process.env.ORDERS_ENDPOINT).then((res) =>
      res.json()
    );

    this.setState({ orders: Items });
  }

  createOrder = () => {
    this.isCreatingOrder = true;
    this.setState({
      itemName: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      }),
      skuId: Math.random().toString(36).substring(7),
      qty: Math.floor(Math.random() * 10 + 1),
      timeStamp: new Date().toISOString(),
      status: 0,
    });
  };

  submitOrder = () => {
    const { orders, ...orderDetails } = this.state;

    this.setState((prevState) => ({
      orders: [{ newOrder: true, ...orderDetails }].concat(prevState.orders),
    }));

    this.createOrder();
  };

  render(_, { itemName, skuId, qty, orders }) {
    console.log("orders:", orders);
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
            <th>Created on</th>
          </tr>
          {!!orders.length &&
            orders.map((order) => <Order key={order.skuId} details={order} />)}
        </table>
      </div>
    );
  }
}

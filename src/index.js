/** @jsx createElement */
import { createElement } from "./domUtils";
import { render } from "./core";
import { Component } from "./component";

class HelloMessage extends Component {
  render() {
    return <div>Hello {this.props.name}</div>;
  }
}

render(<HelloMessage name="John" />, document.getElementById("root"));

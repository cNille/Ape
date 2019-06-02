import { Component, Ape } from "./ape/index";
import { range } from "./ape/util";
import { setProp, createElement } from "./ape/patch";

export default class App extends Component {
  constructor(type, props, ...children) {
    super(type, props, ...children);
  }
  render() {
    return <Container />;
  }
}

class Container extends Component {
  constructor(type, props, ...children) {
    super(type, props, ...children);

    this.state = {
      list: ["Item-0"]
    };
    this.addTodo = this.addTodo.bind(this);
    return this;
  }

  componentWillMount() {
    console.log("Container will mount");
  }

  componentDidMount() {
    console.log("Container mounted");
  }

  addTodo(item) {
    const newList = [...this.state.list, item];
    this.setState({ list: newList });
  }
  removeLast() {
    const newList = this.state.list.slice(0, -1);
    this.setState({ list: newList });
  }

  render() {
    const { list } = this.state;
    return (
      <section>
        <button click={() => this.addTodo(`Item-${list.length}`)}>Click</button>
        <List list={list} />
        <button click={() => this.removeLast()}>RemoveLast</button>
        <List list={["123", "aoeu"]} />
      </section>
    );
  }
}

class Item extends Component {
  render() {
    const { value } = this.props;
    return <li ref={r => console.log("AOEU", r)}>{value}</li>;
  }
}

class List extends Component {
  render() {
    // @
    const list = this.props.list.map(item => <Item value={item} />);
    return <ul>{list}</ul>;
  }
}

var main = document.getElementById("main");
var application = new Ape("main", <App />);

import Component from 'nucleus';

class App {
  constructor(rootId) {
    this.root = document.getElementById(rootId);
    setProp(this.root, 'root');
    this.render = this.render.bind(this);
    this.root.appendChild(createElement(this.render()));
  }
  render() {
    return e(Container, null);
  }
}

class Container extends Component {
  constructor(type, props, ...children) {
    super(type, props, ...children);

    this.state = {
      count: 10
    };
    this.update = this.update.bind(this);
    return this;
  }
  update(count) {
    this.setState({ count });
  }
  render() {
    // @
    const { count } = this.state;
    return e(
      'section',
      null,
      e(
        'button',
        { click: () => this.update(count + 1) },
        'Click'
      ),
      e(List, { count: count })
    );
  }
}
class List extends Component {
  render() {
    // @
    const { count } = this.props;
    const r = range(count);
    const list = r.map(n => e(
      'li',
      null,
      count.toString()
    ));
    return e(
      'ul',
      { className: `color-${count % 3}` },
      list
    );
  }
}

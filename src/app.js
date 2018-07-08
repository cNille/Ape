import { Component, Nucleus } from './nucleus/index'
import { e, range } from './nucleus/util'
import { setProp, createElement } from './nucleus/patch'

export default class App extends Component {
  constructor (type, props, ...children) {
    super(type, props, ...children)
  }
  render () {
    return <Container />
  }
}

class Container extends Component {
  constructor (type, props, ...children) {
    super(type, props, ...children)

    this.state = {
      count: 10
    }
    this.update = this.update.bind(this)
    return this
  }
  update (count) {
    this.setState({ count })
  }
  render () { // @
    const { count } = this.state
    return (
      <section>
        <button click={() => this.update(count + 1)} >Click</button>
        <List count={count} />
      </section>
    )
  }
}
class List extends Component {
  render () { // @
    const { count } = this.props
    const r = range(count)
    const list = r.map(n => <li>{ (count).toString() }</li>)
    return (
      <ul className={`color-${count % 3}`}>
        { list }
      </ul>
    )
  }
}

var main = document.getElementById('main')
var application = new Nucleus('main', <App />)

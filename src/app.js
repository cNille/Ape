import { Component, Ape } from './ape/index'
import { e, range } from './ape/util'
import { setProp, createElement } from './ape/patch'

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
      list: ['Item-0']
    }
    this.addTodo = this.addTodo.bind(this)
    return this
  }

  addTodo (item) {
    const newList = [...this.state.list, item]
    this.setState({ list: newList })
  }
  removeLast () {
    const newList = this.state.list.slice(0, -1)
    this.setState({ list: newList })
  }

  render () {
    const { list } = this.state
    return (
      <section>
        <button click={() => this.addTodo(`Item-${list.length}`)} >Click</button>
        <List list={list} />
        <button click={() => this.removeLast()} >RemoveLast</button>
      </section>
    )
  }
}
class List extends Component {
  render () { // @
    const list = this.props.list.map(item => <li>{ item }</li>)
    return (
      <ul>
        { list }
      </ul>
    )
  }
}

var main = document.getElementById('main')
var application = new Ape('main', <App />)

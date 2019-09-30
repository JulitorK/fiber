/** @jsx createElement */
window.addEventListener("load", initRecursive);

function initRecursive() {
  const root = document.getElementById("root");
  const TEXT_ELEMENT = "TEXT ELEMENT";

  let domTree = null;
  function render(element, parent) {
    domTree = reconcile(parent, domTree, element);
  }

  function reconcile(parent, instance, element) {
    if (instance === null) {
      const newInstance = instantiate(element);
      parent.appendChild(newInstance.dom);
      return newInstance;
    } else if (element === null) {
      parent.removeChild(instance.dom);
    } else if (instance.element.type !== element.type) {
      const newInstance = instantiate(element);
      parent.replaceChild(newInstance.dom, instance.dom);
      return newInstance;
    } else if (typeof element.type === "string") {
      updateDomProperties(instance.dom, instance.element.props, element.props);
      instance.element = element;
      instance.childInstances = reconcileChildren(instance, element);
      return instance;
    } else {
      instance.publicInstance.props = element.props;
      const childElement = instance.publicInstance.render();
      const oldChildInstance = instance.childInstance;
      const childInstance = reconcile(parent, oldChildInstance, childElement);
      instance.childInstance = childInstance;
      instance.dom = childInstance.dom;
      instance.element = element;
      return element;
    }
  }

  function reconcileChildren(instance, element) {
    const instanceChildren = instance.childInstances;
    const elementChildren = element.props.children;
    const count = Math.max(instanceChildren.length, elementChildren.length);
    const reconciledChildren = [];
    for (let i = 0; i < count; i++) {
      const child = reconcile(
        instance.dom,
        instanceChildren[i],
        elementChildren[i]
      );
      reconciledChildren.push(child);
    }

    return reconciledChildren;
  }

  function updateDomProperties(dom, prevProps, nextProps) {
    const isEvent = name => name.startsWith("on");
    const isAttribute = name => !isEvent(name) && name !== "children";

    Object.keys(prevProps)
      .filter(isEvent)
      .forEach(event =>
        dom.removeEventListener(
          event.toLowerCase().substring(2),
          prevProps[event]
        )
      );

    Object.keys(prevProps)
      .filter(isAttribute)
      .forEach(attribute => (dom[attribute] = null));

    Object.keys(nextProps)
      .filter(isEvent)
      .forEach(event =>
        dom.addEventListener(event.toLowerCase().substring(2), nextProps[event])
      );

    Object.keys(nextProps)
      .filter(isAttribute)
      .forEach(attribute => (dom[attribute] = nextProps[attribute]));
  }

  function instantiate(element) {
    const { type, props } = element;
    const isDomElement = typeof element.type === "string";
    if (isDomElement) {
      const dom =
        type === TEXT_ELEMENT
          ? document.createTextNode("")
          : document.createElement(type);
      updateDomProperties(dom, {}, props);

      const childElements = props.children || [];
      const childInstances = childElements.map(instantiate);
      childInstances.forEach(child => dom.appendChild(child.dom));
      return { dom, element, childInstances };
    } else {
      const instance = {};
      const publicInstance = createPublicInstance(element, instance);
      const childElement = publicInstance.render();
      const childInstance = instantiate(childElement);
      const dom = childInstance.dom;
      return Object.assign(instance, {
        dom,
        publicInstance,
        childInstance,
        element
      });
    }
  }

  function createElement(type, config, ...args) {
    const childArray = args || [];
    const children = childArray
      .filter(Boolean)
      .map(child =>
        child instanceof Object ? child : createTextElement(child)
      );
    const props = { ...config, children };
    return { type, props };
  }

  function createTextElement(child) {
    return { type: TEXT_ELEMENT, props: { nodeValue: child, children: [] } };
  }

  class Component {
    constructor(props) {
      this.props = props;
      this.state = this.state || {};
    }

    setState(partial) {
      this.state = Object.assign({}, this.state, partial);
      updateInstance(this.__internalInstance);
    }
  }

  function updateInstance(internalInstance) {
    const parent = internalInstance.dom.parentNode;
    const element = internalInstance.element;
    reconcile(parent, internalInstance, element);
  }

  function createPublicInstance(element, internalInstance) {
    const { type, props } = element;
    const publicInstance = new type(props);
    publicInstance.__internalInstance = internalInstance;
    return publicInstance;
  }

  class App extends Component {
    constructor(props) {
      super(props);
      this.state = { count: 1 };
    }

    handleClick() {
      console.log("this.state", this.state);
      this.setState({ count: ++this.state.count });
    }

    render() {
      return (
        <div>
          <span>count: {this.state.count}</span>
          <button onClick={() => this.handleClick()}>increment</button>
        </div>
      );
    }
  }

  const element = (
    <div>
      <div>hai</div>
      <div>what</div>
      <div>
        up
        <input type="text" value="julitork" />
        <App>warap yo</App>
      </div>
    </div>
  );

  render(element, root);
}

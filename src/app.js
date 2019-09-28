/** @jsx createElement */
window.onload = () => {
  const root = document.getElementById("root");
  const TEXT_ELEMENT = "TEXT ELEMENT";

  let rootInstance = null;
  function render(element, container) {
    rootInstance = reconcile(container, rootInstance, element);
  }

  function reconcile(parentDom, instance, element) {
    if (instance === null) {
      const newInstance = instantiate(element);
      parentDom.appendChild(newInstance.dom);
      return newInstance;
    } else if (element === null) {
      parentDom.removeChild(instance.dom);
    } else if (instance.element.type !== element.type) {
      const newInstance = instantiate(element);
      parentDom.replaceChild(newInstance.dom, instance.dom);
      return newInstance;
    } else if (typeof element.type === "string") {
      updateDomProperties(instance.dom, instance.element.props, element.props);
      instance.element = element;
      instance.childInstances = reconcileChildren(instance, element);
      return instance;
    } else {
      instance.publicInstance.props = element.props;
      const childElement = instance.publicInstance.render();
      const oldChildInstance = instance.publicInstance;
      const childInstance = reconcile(
        parentDom,
        oldChildInstance,
        childElement
      );
      instance.dom = childInstance.dom;
      instance.childInstance = childInstance;
      instance.element = element;
      return element;
    }
  }

  function reconcileChildren(instance, element) {
    const dom = instance.dom;
    const instanceChildren = instance.childInstances;
    const elementChildren = element.props.children || [];
    const count = Math.max(instanceChildren.length, elementChildren.length);
    const newChildInstances = [];
    for (let i = 0; i < count; i++) {
      const instanceChild = instanceChildren[i];
      const elementChild = elementChildren[i];
      const newChild = reconcile(dom, instanceChild, elementChild);
      newChildInstances.push(newChild);
    }
    return newChildInstances.filter(Boolean);
  }

  function instantiate(element) {
    const {type, props} = element;
    const isDomElement = typeof type === "string";
    if (isDomElement) {
      // Instantiate DOM element
      const isTextElement = type === TEXT_ELEMENT;
      const dom = isTextElement
        ? document.createTextNode("")
        : document.createElement(type);

      updateDomProperties(dom, [], props);

      const childElements = props.children || [];
      const childInstances = childElements.map(instantiate);
      const childDoms = childInstances.map(childInstance => childInstance.dom);
      childDoms.forEach(childDom => dom.appendChild(childDom));

      return { dom, element, childInstances };
    }  else {
      // Instantiate component element
      const instance = {};
      const publicInstance = createPublicInstance(element, instance);
      const childElement = publicInstance.render();
      const childInstance = instantiate(childElement);
      const dom = childInstance.dom;

      Object.assign(instance, { dom, element, childInstance, publicInstance });
      return instance;
    }
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

  function createElement(type, config, ...args) {
    const props = { ...config };
    const hasChildren = args.length > 0;
    const rawChildren = hasChildren ? [...args] : [];
    props.children = rawChildren
      .filter(e => e !== null && e !== undefined)
      .map(e => (e instanceof Object ? e : createTextElement(e)));
    return { type, props };
  }

  function createTextElement(value) {
    return createElement(TEXT_ELEMENT, { nodeValue: value });
  }

  function createPublicInstance(element, internalInstance) {
    const { type, props } = element;
    const publicInstance = new type(props);
    publicInstance.__internalInstance = internalInstance;
    return publicInstance;
  }

  function updateInstance(internalInstance) {
    const parentDom = internalInstance.dom.parentNode;
    const element = internalInstance.element;
    reconcile(parentDom, internalInstance, element);
  }

  class Component {
    constructor(props) {
      this.props = props;
      this.state = this.state || {};
    }

    setState(partialState) {
      this.state = Object.assign({}, this.state, partialState);
      updateInstance(this.__internalInstance);
    }
  }

  class App extends Component {
    constructor(props) {
      super(props);
      this.state = { test: "does state work?" };
    }
    render() {
      return <div>{this.state.test}</div>;
    }
  }

  const element = (
    <div>
      <div>hai</div>
      <div>it works</div>
      <input type="text" value="julitorkaa" />
      <App />
    </div>
  );

  render(element, root);
};

/** @jsx createElement */
window.onload = () => {
  const root = document.getElementById("root");
  const TEXT_ELEMENT = "TEXT ELEMENT";
  const element = (
    <div>
      <div>hai</div>
      <div>it works</div>
      <input type="text" value="john"/>
    </div>
  );

  function render(node, parentNode) {
    const { type, props } = node;

    const isTextElement = type === TEXT_ELEMENT;

    const dom = isTextElement
      ? document.createTextNode("")
      : document.createElement(type);

    const isListener = name => name.startsWith("on");

    Object.keys(props)
      .filter(isListener)
      .forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, props[name]);
      });

    const isAttribute = name => !isListener(name) && name !== "children";

    Object.keys(props)
      .filter(isAttribute)
      .forEach(name => {
        dom[name] = props[name];
      });
    const childElements = props.children || [];

    childElements.forEach(childElement => render(childElement, dom));
    parentNode.append(dom);
  }

  function createElement(type, config, ...args){
    console.log('works');
    const props = {...config};
    const hasChildren = args.length > 0;
    const rawChildren = hasChildren ? [...args] : [];
    props.children = rawChildren
      .filter(e => e !== null && e !== undefined)
      .map(e => e instanceof Object ? e : createTextElement(e));
    console.log('{type, props}', {type, props});
    return {type, props}
  }

  function createTextElement(value){
    return createElement(TEXT_ELEMENT, {nodeValue: value})
  }

  render(element, root);
};

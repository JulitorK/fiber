"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @jsx createElement */
window.onload = function () {
  var root = document.getElementById("root");
  var TEXT_ELEMENT = "TEXT ELEMENT";
  var element = createElement("div", null, createElement("div", null, "hai"), createElement("div", null, "it works"), createElement("input", {
    type: "text",
    value: "john"
  }));

  function render(node, parentNode) {
    var type = node.type,
        props = node.props;
    var isTextElement = type === TEXT_ELEMENT;
    var dom = isTextElement ? document.createTextNode("") : document.createElement(type);

    var isListener = function isListener(name) {
      return name.startsWith("on");
    };

    Object.keys(props).filter(isListener).forEach(function (name) {
      var eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, props[name]);
    });

    var isAttribute = function isAttribute(name) {
      return !isListener(name) && name !== "children";
    };

    Object.keys(props).filter(isAttribute).forEach(function (name) {
      dom[name] = props[name];
    });
    var childElements = props.children || [];
    childElements.forEach(function (childElement) {
      return render(childElement, dom);
    });
    parentNode.append(dom);
  }

  function createElement(type, config) {
    var props = _objectSpread({}, config);

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    var hasChildren = args.length > 0;
    var rawChildren = hasChildren ? [].concat(args) : [];
    props.children = rawChildren.filter(function (e) {
      return e !== null && e !== undefined;
    }).map(function (e) {
      return e instanceof Object ? e : createTextElement(e);
    });
    return {
      type: type,
      props: props
    };
  }

  function createTextElement(value) {
    return createElement(TEXT_ELEMENT, {
      nodeValue: value
    });
  }

  render(element, root);
};
//# sourceMappingURL=app.js.map
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @jsx createElement */
window.onload = function () {
  var root = document.getElementById("root");
  var TEXT_ELEMENT = "TEXT ELEMENT";
  var rootInstance = null;

  function render(element, container) {
    rootInstance = reconcile(container, rootInstance, element);
  }

  function reconcile(parentDom, instance, element) {
    if (instance === null) {
      var newInstance = instantiate(element);
      parentDom.appendChild(newInstance.dom);
      return newInstance;
    } else if (element === null) {
      parentDom.removeChild(instance.dom);
    } else if (instance.element.type !== element.type) {
      var _newInstance = instantiate(element);

      parentDom.replaceChild(_newInstance.dom, instance.dom);
      return _newInstance;
    } else if (typeof element.type === "string") {
      updateDomProperties(instance.dom, instance.element.props, element.props);
      instance.element = element;
      instance.childInstances = reconcileChildren(instance, element);
      return instance;
    } else {
      instance.publicInstance.props = element.props;
      var childElement = instance.publicInstance.render();
      var oldChildInstance = instance.publicInstance;
      var childInstance = reconcile(parentDom, oldChildInstance, childElement);
      instance.dom = childInstance.dom;
      instance.childInstance = childInstance;
      instance.element = element;
      return element;
    }
  }

  function reconcileChildren(instance, element) {
    var dom = instance.dom;
    var instanceChildren = instance.childInstances;
    var elementChildren = element.props.children || [];
    var count = Math.max(instanceChildren.length, elementChildren.length);
    var newChildInstances = [];

    for (var i = 0; i < count; i++) {
      var instanceChild = instanceChildren[i];
      var elementChild = elementChildren[i];
      var newChild = reconcile(dom, instanceChild, elementChild);
      newChildInstances.push(newChild);
    }

    return newChildInstances.filter(Boolean);
  }

  function instantiate(element) {
    var type = element.type,
        props = element.props;
    var isDomElement = typeof type === "string";

    if (isDomElement) {
      // Instantiate DOM element
      var isTextElement = type === TEXT_ELEMENT;
      var dom = isTextElement ? document.createTextNode("") : document.createElement(type);
      updateDomProperties(dom, [], props);
      var childElements = props.children || [];
      var childInstances = childElements.map(instantiate);
      var childDoms = childInstances.map(function (childInstance) {
        return childInstance.dom;
      });
      childDoms.forEach(function (childDom) {
        return dom.appendChild(childDom);
      });
      return {
        dom: dom,
        element: element,
        childInstances: childInstances
      };
    } else {
      // Instantiate component element
      var instance = {};
      var publicInstance = createPublicInstance(element, instance);
      var childElement = publicInstance.render();
      var childInstance = instantiate(childElement);
      var _dom = childInstance.dom;
      Object.assign(instance, {
        dom: _dom,
        element: element,
        childInstance: childInstance,
        publicInstance: publicInstance
      });
      return instance;
    }
  }

  function updateDomProperties(dom, prevProps, nextProps) {
    var isEvent = function isEvent(name) {
      return name.startsWith("on");
    };

    var isAttribute = function isAttribute(name) {
      return !isEvent(name) && name !== "children";
    };

    Object.keys(prevProps).filter(isEvent).forEach(function (event) {
      return dom.removeEventListener(event.toLowerCase().substring(2), prevProps[event]);
    });
    Object.keys(prevProps).filter(isAttribute).forEach(function (attribute) {
      return dom[attribute] = null;
    });
    Object.keys(nextProps).filter(isEvent).forEach(function (event) {
      return dom.addEventListener(event.toLowerCase().substring(2), nextProps[event]);
    });
    Object.keys(nextProps).filter(isAttribute).forEach(function (attribute) {
      return dom[attribute] = nextProps[attribute];
    });
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

  function createPublicInstance(element, internalInstance) {
    var type = element.type,
        props = element.props;
    var publicInstance = new type(props);
    publicInstance.__internalInstance = internalInstance;
    return publicInstance;
  }

  function updateInstance(internalInstance) {
    var parentDom = internalInstance.dom.parentNode;
    var element = internalInstance.element;
    reconcile(parentDom, internalInstance, element);
  }

  var Component =
  /*#__PURE__*/
  function () {
    function Component(props) {
      _classCallCheck(this, Component);

      this.props = props;
      this.state = this.state || {};
    }

    _createClass(Component, [{
      key: "setState",
      value: function setState(partialState) {
        this.state = Object.assign({}, this.state, partialState);
        updateInstance(this.__internalInstance);
      }
    }]);

    return Component;
  }();

  var App =
  /*#__PURE__*/
  function (_Component) {
    _inherits(App, _Component);

    function App(props) {
      var _this;

      _classCallCheck(this, App);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(App).call(this, props));
      _this.state = {
        test: "does state work?"
      };
      return _this;
    }

    _createClass(App, [{
      key: "render",
      value: function render() {
        return createElement("div", null, this.state.test);
      }
    }]);

    return App;
  }(Component);

  var element = createElement("div", null, createElement("div", null, "hai"), createElement("div", null, "it works"), createElement("input", {
    type: "text",
    value: "julitorkaa"
  }), createElement(App, null));
  render(element, root);
};
//# sourceMappingURL=app.js.map
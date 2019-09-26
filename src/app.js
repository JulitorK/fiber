window.onload = () => {
    const root = document.getElementById('root');
    const element = {
        type: 'div',
        props: {
            id: 'container',
            children: [
                { type: 'input', props: {value: 'foo', type: 'text'} },
                { type: 'a', props: {href: '/bar'} },
                { type: 'span', props: { children: [{type: 'TEXT ELEMENT', props: { nodeValue: 'Bar'}}]} }
            ]
        }
    };

    function render(node, parentNode){
        const {type, props} = node;

        const isTextElement = type === 'TEXT ELEMENT';

        const dom = isTextElement ? document.createTextNode("") : document.createElement(type);

        const isListener = (name) => name.startsWith('on');

        Object.keys(props).filter(isListener).forEach(name => {
            const eventType = name.toLowerCase().substring(2);
            dom.addEventListener(eventType, props[name]);
        });

        const isAttribute = (name) => !isListener(name) && name !== 'children';

        Object.keys(props).filter(isAttribute).forEach(name => {
           dom[name] = props[name];
        });
        const childElements = props.children || [];

        childElements.forEach(childElement => render(childElement, dom));
        parentNode.append(dom);
    }

    render(element, root);
};
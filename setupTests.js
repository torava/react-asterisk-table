const enzyme = require('enzyme');
const adapter = require('@wojtekmaj/enzyme-adapter-react-17');

// Setup enzyme's react adapter
enzyme.configure({
    adapter: new adapter()
});
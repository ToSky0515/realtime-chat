/*
Import home controller from our controllers
*/
const {
  ChatController
} = require('./controllers/chat');

const {
  StaticController
} = require('./controllers/static');

/*
Routes must be then stored as METHOD:PATH
So we could have a support for restful requests
*/
const Routes = {
  'GET:/': ChatController,
  'Custom404': StaticController, // Checkout router at line 41
}

module.exports = Routes;
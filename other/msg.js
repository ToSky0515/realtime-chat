const moment = require('moment');
//message format
const formatMessage = (user,message) =>{
    return{
        user,
        message,
        time: moment().format('h:mm a')
    }
};

module.exports = formatMessage;
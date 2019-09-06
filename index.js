const {putItem} = require('./dynamo');

exports.handler = async (event) => {
  const decodedMessage = decodeURIComponent(event.body);
  const messageObjectString = decodedMessage.split('payload=')[1]
  const messageObject = JSON.parse(messageObjectString)
  const messageValue = messageObject.actions[0].value
  
  if(messageValue === 'Approve') {
      console.log('This has been approved!!')
      putItem();
      
  } else {
      console.log('Denied!!!')
  }
}

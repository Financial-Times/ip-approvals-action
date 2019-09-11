const {putItem} = require('./dynamo');

exports.handler = async (event) => {
  if(event) {
    const decodedMessage = decodeURIComponent(event.body);
    const messageObjectString = decodedMessage.split('payload=')[1]
    const messageObject = JSON.parse(messageObjectString)
    const messageValue = JSON.parse(messageObject.actions[0].value)

    putItem(messageValue);
  } else {
    console.log("No event")
    // Use this to retrigger a slack message to approver 
  }

}

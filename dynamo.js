const moment = require('moment');
const AWS = require('aws-sdk');
const uuid = require('uuidv4').default;

module.exports = {
    putItem: (request) => {
      const dynamodb = new AWS.DynamoDB.DocumentClient();
      var params = {
         Item: {
            'approval-id': `aid-${uuid()}`,
            'user': request.user,
            'reason': request.reason,
            'url': request.url,
            'cost': request.cost,
            'calendarYear': request.calendarYear,
            'travelCost': request.travelCost,
            'additionalInfo': request.additionlInfo,
            'status': request.status, 
            'requestDate': request.requestDate,   
            'actionedDate': moment().format("DD/MM/YYYY HH:mm:ss")   
         }, 
         TableName: "submit-approvals"
      };

      dynamodb.put(params, function(err, data) {
         if (err) {
            console.log(err, err.stack); // an error occurred
         } else {
            console.log('Item was put successfully'); // successful response
         }    
      });  
      // To update the dynamoDB item to determine whether or not a request has been approved or denied, see 
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateItem-property
      // Note: Function is labelled as updateItem but may actually be update.
   }
}



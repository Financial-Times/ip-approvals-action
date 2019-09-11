const AWS = require('aws-sdk');
const uuid = require('uuidv4').default;

module.exports = {
    putItem: () => {
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    var params = {
     Item: {
        'approval-id': `aid-${uuid()}`,
        timestamp: '23/08/2019 14:33:21',
        'requester-email': 'jill.ward@ft.com',
        'request-type': 'Conference',
        'request-url': 'http://www.conferencename.com',
        'cost': '500',
        'calendar-year': '2019',
        'travel-cost': '0',
        'addl-info': 'Additional info here'         
    }, 
    TableName: "submit-approvals"
   };
        console.log("Put item into DynamoDB");
        console.log(params.Item['approvalId'])
           dynamodb.put(params, function(err, data) {
             if (err) {
                console.log(err, err.stack); // an error occurred
             } else {
                console.log('Item was put successfully');           // successful response
             }    
           });
    }
}




exports.handler = async (event) => {
    
    let str_response_body = "";
    let int_response_status = 418;
   
    try {
        
       if (event.Details.ContactData.CustomerEndpoint.Type == "TELEPHONE_NUMBER") {
           
          let str_processed_number = transformPhoneNumber(event.Details.ContactData.CustomerEndpoint.Address);
          let str_number = event.Details.ContactData.CustomerEndpoint.Address;

          let arr_file = getDictionary();

          let arr_vanity_words = getVanityWords(str_processed_number, arr_file); 

          let arr_vanity_numbers = createVanityPhoneNumbers(str_number);

          let arr_data_to_write = {"callingNumber": str_number, "vanityNumbers": arr_vanity_numbers}; //create item to be stored in the database

          storeVanityNumbers(arr_data_to_write); //Write caller's number and their vanity numbers to the db

          str_response_body = generateResponse(arr_vanity_numbers); 

          int_response_status = 200;
           
       } else {
           
           throw "Not a Phone Number";
       }
        
    } catch (ex) {
        
        str_response_body = {"error name": ex.name, "error": ex.message, "line": ex.lineNumber};
        int_response_status = 400;
        
    }

    const response = {
        statusCode: int_response_status,
        outputSpeech: str_response_body
    };
    
    
    return response;
};


/**
 * Name:            storeVanityNumbers 
 * Purpose:         Writes the list of vanity numbers returned by the function to the database 
 * Author:          Paul Travis
 * Created:         3/14/2021
 * Last Changed:    3/14/2021
 * Last Changed By: Paul Travis
 */
function storeVanityNumbers(arr_data_to_write) {

  var AWS = require('aws-sdk');

  AWS.config.update({region: 'us-east-1'});

  var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

  var params = {

    TableName: 'vanityNumbers',
    Item: arr_data_to_write

  };

  ddb.putItem(params, function(err, data) {

    if (err) {

      throw err; 

    } 

  });

}


/**
 * Name:            generateResponse 
 * Purpose:         Generates an SSML format response to be used in the AWS Connect Flow. 
 * Author:          Paul Travis
 * Created:         3/11/2021
 * Last Changed:    3/11/2021
 * Last Changed By: Paul Travis
 */
function generateResponse(arr_vanity_numbers) {

  var str_response = "";
  
  if (arr_vanity_numbers.length > 0) {

  
    str_response = "<speak>The following vanity numbers were found for your phone number: ";

    var i;
    
    for (i = 0; i < arr_vanity_numbers.length; i++) {

      str_response += numToWord(i + 1) + " Vanity Number: <say-as interpret-as='telephone'>" + arr_vanity_numbers[i] + "</say-as><break strength='medium' />";

    }

    str_response += "</speak>";

  } else {

    str_response = "<speak>No vanity numbers were found for your phone number.</speak>";

  }

  return str_response;

}


/**
 * Name:            numToWord 
 * Purpose:         Converts an integer number to it's positional word format (id est, first, second third, etc) 
 * Author:          Paul Travis
 * Created:         3/11/2021
 * Last Changed:    3/11/2021
 * Last Changed By: Paul Travis
 */
function numToWord(int_num) {

  switch (int_num) {

    case 1:
      return "First";
      break;
    
    case 2:
      return "Second";
      break;

    case 3:
      return "Third";
      break;

    case 4:
      return "Fourth";
      break;

    case 5:
      return "Fifth";
      break;

    default:
      throw "Invalid Number";

  }

}

/**
 * Name:            createVanityPhoneNumbers
 * Purpose:         Takes an array of words and numbers and uses it to replace part of the phone number and puts that into another array which gets returned.
 * Author:          Paul Travis
 * Created:         3/11/2021
 * Last Changed:    3/11/2021
 * Last Changed By: Paul Travis
 */
function createVanityPhoneNumbers(str_number, arr_vanity_words) {

  var i;
  var arr_vanity_numbers = [];

  for (i = 0; i < arr_vanity_words.length; i++) {

    var str_vanity_number = str_number.replace(arr_vanity_words[i].number, arr_vanity_words[i].word);

    arr_vanity_numbers.push(str_vanity_number);

  }

  return arr_vanity_numbers;

}

/**
 * Name:            getDictionary
 * Purpose:         Reads in the dictionary file used to test if the caller's phone number contains words.
 * Author:          Paul Travis
 * Created:         3/8/2021
 * Last Changed:    3/14/2021
 * Last Changed By: Paul Travis
 */
function getDictionary() {

    var json_dictionary = require('./words_shorter_than_11_sorted.json');
    
    return json_dictionary
    
}

/**
 * Name:            transformPhoneNumber
 * Purpose:         Clean a phone number of unneded characters such as the + symbol.
 * Author:          Paul Travis
 * Created:         3/6/2021
 * Last changed:    3/11/2021
 * Last Changed By: Paul Travis
 */
function transformPhoneNumber(number) {
    
    number = number.replace(/\D/gi, ""); //clear off the plus symbol from the front along with any other gook that we don't want
    number = number.replace(/1|0/gi, " "); //replace 1 and 0 with spaces as they don't have a corresponding value on the numberpad.
    
    return number;
    
}


/**
 * Name:            getVanityWords
 * Purpose:         get a list of words that are contained in the given phone number and return them
 * Author:          Paul Travis
 * Created:         3/8/2021
 * Last Changed:    3/10/2021
 * Last Changed By: Paul Travis
 */
function getVanityWords(str_number, arr_file) {
    
    var i;
    var arr_vanity_words = [];
    
    for (i = 0; i < arr_file.length; i++) {
        
      if (str_number.search(arr_file[i].number) > -1) {

        arr_vanity_words.push(arr_file[i]);


        if (arr_vanity_words.length == 5) {

          return arr_vanity_words;

        }

          
      }
        
        
    }
    
}


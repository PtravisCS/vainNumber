const AWS = require('aws-sdk');

module.exports.handler = async (event) => {
   
    const INT_SUCCESS_CODE = 200;
    const INT_DEFAULT_FAILURE_CODE = 400;

    let str_response_body = "";
    let int_response_status = 418; //If we recieve this error as a return value something has gone horribly wrong.
   
    try {
        
       if (event.Details.ContactData.CustomerEndpoint.Type == "TELEPHONE_NUMBER") {
           
          const STR_PROCESSED_NUMBER = transformPhoneNumber(event.Details.ContactData.CustomerEndpoint.Address); //Caller number stripped of non-numberics, 1, and 0.
          const STR_NUMBER = event.Details.ContactData.CustomerEndpoint.Address; //Original caller's number unmodified

          let arr_vanity_numbers = await checkIfPreviouslyCalled(STR_NUMBER); //read from DB to see if this number has previously called the function. If so just re-use that data.

          if (!arr_vanity_numbers) { //If the DB doesn't return any entries for the calling number generate a fresh set of vanity numbers and store them in the DB.
            
            arr_vanity_numbers = produceVanityNumbers(STR_PROCESSED_NUMBER, STR_NUMBER);

            await storeVanityNumbers(STR_NUMBER, arr_vanity_numbers); //Write caller's number and their vanity numbers to the db

          }

          str_response_body = generateResponse(arr_vanity_numbers);

          int_response_status = INT_SUCCESS_CODE;
           
       } else {
           
           throw new Error("Not a Phone Number");
       }
        
    } catch (ex) {
        
        str_response_body = {"error name": ex.name, "error": ex.message, "line": ex.lineNumber};
        int_response_status = INT_DEFAULT_FAILURE_CODE;
        
    }
    
    return generateFinalResponse(int_response_status, str_response_body);
};

/**
 * Name:            produceVanityNumbers
 * Purpose:         Generates the JSON response to send to the lambda caller. 
 * Author:          Paul Travis
 * Created:         3/17/2021
 * Last Changed:    3/18/2021
 * Last Changed By: Paul Travis
 */
function generateFinalResponse(int_response_status, str_response_body) {

    return {
        statusCode: int_response_status,
        outputSpeech: str_response_body
    };

}

/**
 * Name:            produceVanityNumbers
 * Purpose:         Handles producing a list of vanity numbers and returns the list of vanity numbers to the caller 
 * Author:          Paul Travis
 * Created:         3/17/2021
 * Last Changed:    3/18/2021
 * Last Changed By: Paul Travis
 */
function produceVanityNumbers(str_processed_number, str_number) {

  const ARR_FILE = getDictionary();

  let arr_vanity_words = getVanityWords(str_processed_number, ARR_FILE);

  const ARR_VANITY_NUMBERS = createVanityPhoneNumbers(str_number, arr_vanity_words);

  return ARR_VANITY_NUMBERS;

}

/**
 * Name:            checkIfPreviouslyCalled 
 * Purpose:         Checks the database to see if a number has previously called and if so returns the related entry
 * Author:          Paul Travis
 * Created:         3/16/2021
 * Last Changed:    3/18/2021
 * Last Changed By: Paul Travis
 */
async function checkIfPreviouslyCalled(str_number) {
  
  const DDB_DOCUMENT_CLIENT = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
  
  const PARAMS = {
    TableName: 'vanityNumbers',
    Key: {
      callingNumber: str_number
    }
  };
  
  try {

    const ARR_RETURNED_ITEM = await DDB_DOCUMENT_CLIENT.get(PARAMS).promise();

    if (ARR_RETURNED_ITEM.Item.vanityNumbers) {

      return ARR_RETURNED_ITEM.Item.vanityNumbers;

    } else {

      return;

    }

  } catch (ex) {
  
    return; //If we return nothing even if there is something it gives the prog. a chance to still generate some valid vanity numbers

  }

  
}

/**
 * Name:            storeVanityNumbers 
 * Purpose:         Writes the list of vanity numbers returned by the function to the database 
 * Author:          Paul Travis
 * Created:         3/14/2021
 * Last Changed:    3/18/2021
 * Last Changed By: Paul Travis
 */
async function storeVanityNumbers(str_number, arr_vanity_numbers) {
  
  const ARR_DATA_TO_WRITE = {"callingNumber": str_number, "vanityNumbers": arr_vanity_numbers}; //create item to be stored in the database

  const DDB_DOCUMENT_CLIENT = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

  const PARAMS = {

    TableName: 'vanityNumbers',
    Item: ARR_DATA_TO_WRITE

  };
  
  await DDB_DOCUMENT_CLIENT.put(PARAMS).promise();

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
      throw new Error("Invalid Number");

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
 * Last Changed:    3/18/2021
 * Last Changed By: Paul Travis
 */
function getDictionary() {

    const JSON_DICTIONARY = require('./words_shorter_than_11_sorted.json');
    
    return JSON_DICTIONARY;
    
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
 * Last Changed:    3/18/2021
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

    return arr_vanity_words; //If there is less than 5 total vanity words available for the given phone number
    
}


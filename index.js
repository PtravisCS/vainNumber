
exports.handler = async (event) => {
    
    let str_response_body = "";
    let int_response_status = 418;
   
    try {
        
       if (event.Details.ContactData.CustomerEndpoint.Type == "TELEPHONE_NUMBER") {
           
          let str_number = stripNumber(event.Details.ContactData.CustomerEndpoint.Address);

          let arr_file = readFile();

          let arr_vanity_words = getVanityWords(str_number, arr_file);

          str_response_body = arr_vanity_words;
          int_response_status = 200;
           
       } else {
           
           throw "Not a Phone Number";
       }
        
    } catch (ex) {
        
        str_response_body = ex.message;
        int_response_status = 400;
        
    }

    const response = {
        statusCode: int_response_status,
        body: JSON.stringify(str_response_body),
    };
    
    
    return response;
};

/**
 * Name:            readFile
 * Purpose:         Reads in the dictionary file used to test if the caller's phone number contains words.
 * Author:          Paul Travis
 * Created:         3/8/2021
 * Last Changed:    3/9/2021
 * Last Changed By: Paul Travis
 */
function readFile() {

    var json_dictionary = require('./words_shorter_than_11_sorted.json');
    
    return json_dictionary
    
}

/**
 * Name:            stripNumber
 * Purpose:         Clean a phone number of unneded characters such as the + symbol.
 * Author:          Paul Travis
 * Created:         3/6/2021
 * Last changed:    3/8/2021
 * Last Changed By: Paul Travis
 */
function stripNumber(number) {
    
    number = number.replace(/\D/gi, ""); //clear off the plus symbol from the front along with any other gook that we don't want
    number = number.replace(/1|0/gi, " "); //replace 1 and 0 with spaces as they don't have a corresponding value on the numberpad.
    
    return number;
    
}


/**
 * Name:            getVanityWords
 * Purpose:         get a list of words that match the given phone number
 * Author:          Paul Travis
 * Created:         3/8/2021
 * Last Changed:    3/10/2021
 * Last Changed By: Paul Travis
 */
function getVanityWords(str_number, arr_file) {
    
    var i;
    var arr_vanity_words;
    
    for (i = 0; i < arr_file.length; i++) {
        
        if (str_number.search(arr_file[i].number) > -1) {
            
            arr_vanity_words.push(arr_file[i]);
            
        }
        
        if (arr_vanity_words.length == 5) {
            
            return arr_vanity_words;
            
        }
        
    }
    
}


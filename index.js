exports.handler = async (event) => {
    
    let str_response_body = "";
    let int_response_status = 418;
   
    try {
        
       if (event.Details.ContactData.CustomerEndpoint.Type == "TELEPHONE_NUMBER") {
           
           let str_number = stripNumber(event.Details.ContactData.CustomerEndpoint.Address);
           
           let str_vanity_numbers = convertToVanity(str_number);
           
           str_response_body = str_number;
           int_response_status = 200;
           
       } else {
           
           throw "Not a Phone Number";
       }
        
    } catch (ex) {
        
        str_response_body = ex;
        int_response_status = 400;
        
    }

    const response = {
        statusCode: int_response_status,
        body: JSON.stringify(str_response_body),
    };
    
    
    return response;
};

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

function convertToVanity(number) {
    
    
    
}
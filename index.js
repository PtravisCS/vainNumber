
exports.handler = async (event) => {
    
    let str_response_body = "";
    let int_response_status = 418;
   
    try {
        
       if (event.Details.ContactData.CustomerEndpoint.Type == "TELEPHONE_NUMBER") {
           
           let str_number = stripNumber(event.Details.ContactData.CustomerEndpoint.Address);
           
           let arr_data = readFile();
           
           let arr_file = [];
           
           if (arr_data.status == "200") {
               
               arr_file = arr_data.data;
               
            } else {
                
                throw "Failed to Read File";
                
            }
           
            let arr_vanity_words = getVanityWords(str_number, arr_file);
           
            str_response_body = arr_vanity_words;
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

function readFile() {

    const fs = require('fs');
    const papa = require('papaparse');

    const file = fs.createReadStream('words_shorter_than_11_sorted.csv'); 
    let dictionary_words = [];

    try {
        papa.parse(file, {
        
            header: true,
            worker: false,
            step: function(results, parser) {
                
                dictionary_words.push(results.data);

            },
            complete: function(results, file) {

                return { 
                    data: dictionary_words,
                    status: 200
                };
            }
            
        });

    } catch (ex) {

        return {
            
            data: dictionary_words,
            status: 400
        };

    }
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

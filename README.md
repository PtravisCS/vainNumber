## vainNumber ##

AWS lambda function to convert a phone number to vanity numbers.
This program is triggered by an Amazon Connect Flow and takes the phone number field from the Connect call.
This data is then processed to find a list of possible words that would match the phone number.
Finally, this data is written out to a dynamoDB table before being returned to the Connect Flow.

Code can be tested by calling +1-877-375-1213

This program was developed over a twoish week period for a coding test, starting with me having zero knowledge of how AWS systems worked.
Over the course of this program I feel I have gained a better understanding of both AWS systems and Serverless.com.
It also contributed to my knowledge base surrounding Node.js

If I had more time I likely would have continued to improve the program to test if multiple words fit in a phone number, and would have attempted to make the program work with international numbers (though potentially not international wordlists).
I also would likely have put more time into the dictionary/wordlist used by the program.

### Assumptions ##

* The program is only designed to work for a U.S. 10-digit phone number, in theory it will work with longer or shorter phone numbers, but longer numbers will still only be tested for 10 digit or shorter words. This could be changed by replacing the dictionary file for the program.

* The program only test for British English words using a self-modified variant of the Debian [wbritish](https://github.com/PtravisCS/vainNumber) GNU/Linux British English wordlist.

* The program assumes that the vanity number with the most numbers replaced by the word is the best possible vanity number. E.g. 123456 -> 12word is worse than 123456 -> 1words (neither of these are actually valid conversions mind).
  
* The assignment as provided says to save the best 5 vanity numbers, and says to read all 3 of them off to the user (paraphrased). Given the disconnect between those two numbers I elected to err on the side of caution and have the program read all 5 vanity numbers. In a real project environment I would instead have asked a manager, the PM, or the client (whoever was most relevent) to clarify the requirement.

### Shortcuts ###

* The dictionary was prepared using a quick \(and somewhat dirty\) [helper program](https://github.com/PtravisCS/dictionary_parser) I developed for purpose. 

* A single large try catch was used around the main body of code instead of more specific and meaningful try-catch statements.

* I didn't use typescript as I wasn't super familiar with it and didn't want to add an extra variable into the pot of things that needed to be learned while working on this project. Instead I used as psuedo-hungarian notation for my variable names to help make up for this.

* Attempts are made to fit only one word into the given phone number instead of recursively testing phone numbers to see if more words can be fit in.

### Difficulties ###

* I had some reasonable difficulties when I tried to convert from raw text output to SSML. This was caused by a combination of issues with both my lambda and with the setup of the flow.

* Further difficulties were encountered while setting up the lambda to read/write from/to the DynamoDB instance. This was caused by a need to grant permissions to the Lambda for accessing the DB and because the AWS code expects to be called asynchronously and I had been doing synchronous calls.

* Initial account setup for AWS was a bit of a struggle as I spent around 2 - 3 days getting my credit card to allow the AWS transaction to go through and for AWS to accept my card.
  This was resolved by several phone calls to my credit card company.

* There was also a bit of a learning curve to familiarize myself with AWS systems and how to get these systems to interoperate.
  This was resolved by a combination of reading through the documentation and poking around AWS itself.

* Initially setting up my program to work with Serverless.com was difficult due to my using a pre-existing format and also due to my linking the project to the dashboard (which resulted in an oddly/mal formatted serverless.yml file blocking development temporarily).
  This was resolved by un-linking the project from the online dashboard (unfortunately as this prevented me from using CI/CD to deploy straight from GitHub).

### Reasoning ###

#### Programming Language ####

Node.Js was used as it seemed to have the best support and documentation available. I was familiar enough with it to be comfortable working in JS for this project as well.
Further node has npm which makes package management much easier than in Java (unless you're using Maven) which would be my second pick for a language.

#### Architecture ####

The code is setup to be deployed via Serverless.com as opposed to raw AWS this was done to simplify deployment (now I just need to do ``serverless deploy`` instead of the clunkier aws cli.
I also found that this enabled me to better/more easily manage program attributes such as permissions needed and database table access from within the code base as opposed to having to use the AWS web interface.

#### Naming Conventions ####

For variable names I chose to use snake\_case names. This was done for three reasons: 
1. Snake case works well with the naming convention of using all caps on Consts. I also find it works better than camalCase when using a pseudo-hungarian notation. 
2. A lot of my normal/preferred programming languages for personal projects (C, C++, Rust, PHP) use snake\_case for variable names or method/function names, as such I am somewhat more familiar with it.
3.  Finally, I personally find it more readable than camelCase and PascalCase. For no particular reason I also prefer it to Lisp-Case.

For function names I chose to go with camelCase, this was done entirely just to differentiate them from variables.

I also chose to follow the C-style convention of placing consts in all caps.

Finally, I chose to append a psuedo-hungarian notation of my own making to the front of most variables to make it easier to keep track of which data type was being stored in each variable.
This was done in leu of using TypeScript which I was not familiar enough with to be comfortable to add to my project in addition to all the other things being learned.
I tried to keep the logic behind this notation simple:

* str - String
* int - Integer
* arr - Array

For both variable and function names I tried to pick names that were able to effectively describe the variable/function's purpose.
This in turn led to some more verbose names.
For functions in particular I also tended to pick more generic names where/when possible to leave open the avenue for future modifications to the function (exempli gratia, storeData instead of writeToDB).

#### The Dictionary File ####

The dictionary file used by this program is the Debian GNU/Linux system dictionary found in /usr/share/dict/words.
This in turn is part of the [wbritish](https://packages.debian.org/jessie/wbritish) package.

This package has a crayon license attached to it that only requires inclusion of the original license when using the wordlist.

The reason the British English wordlist was selected over the U.S. English wordlist is entirely due to this being the wordlist installed at the time on my server which I was using for development.
To be entirely honest I wasn't aware I was using the British English wordlist until after I went to look up the copyright.

Originally I tried to format the dictionary as a CSV file, but after spending some time trying to load the file using the Papa-Parse library I elected to reformat the dictionary as JSON since JS can natively load JSON files without requiring external libraries or convoluted functions.

I elected to remove all 1-character words from the dictionary as they were effectively meaningless in the context of this program.
Likewise, I removed all words over 10 characters long as they would never appear in a 10-digit U.S. phone number.

Finally, all words with accented characters were removed as there was no way to represent them in a phone number.

This formatting was done using a quick and simple [helper program](https://github.com/PtravisCS/dictionary_parser) I wrote, this program is not well designed as it was built for an effectively 1 time use.

The JSON format of the dictionary is described more in the README for the helper program.

#### Code ####

At a high level, the main code body stored in index.js is comprised of a 43-line main function and 10 sub-functions.
This was done to help with readability, and re-usability.

For each function I tried to maintain a singleness of purpose to ensure a minimum amount of unnecessary code within each function.

Anything throughout the program that was not modified at a later point in the program was (read: should be) declared as a const to cut down on unnecessary mutability (and ergo unnecessary data complexity).

Starting from the top of the code, aws-sdk is included due to it being needed to access dynamo-db.

Two consts are provided at the top of the lambda to allow more easily changing the response codes returned by the function, one for success and one for failure.
This way one does not need to go through the entire code body to change that out.

int\_response\_status is initialized to the relatively meaningless http error code 418; this value is replaced on all code paths before the function can return.
Ergo, if this error code is received after running the lambda something odd, and likely catastrophic, has occurred.
I picked the 418 error code as it is unlikely to be encountered in the wild and as such should be less likely to (but not impossible to) conflict with other error codes defined in the program.

The rest of "main" is wrapped in a try-catch block to allow "gracefully" handling errors. Currently the code just returns an error code and the body contains error information.
The Connect Flow is designed to check for the status code and branches based on its value, this enables the Flow to provide more meaningful responses to users in the event of an error potentially improving the user experience when compared to the alternative of program outright failing.

The program will check the dynamoDB database to see if a phone number has previously called this function prior to trying to generate new vanity numbers, this way if the number has called before precious CPU cycles can be saved by not requiring the more intensive portions of the code to run and instead just returning previously stored results.

The "generateFinalResponse" function was created to "future-proof" the code, in that currently the function is effectively adding more code than if its contents were in main. But by swapping in this function the code used to generate the final output of the program can be changed without (majorly) impacting main.

I chose to use SSML markup formatting for the output to help make it somewhat slightly easier to understand what the Text-To-Speech utility was saying to the user. Further formatting is necessary on this I would argue as it is not currently as intelligible as I would prefer.

The version of the phone number used to search for vanity words is stripped of all non-numeric characters, 1's, and 0's in order to simplify the process of testing it against the wordlist.

### AWS Connect Contact Flow ###

![Image of my Contact Flow](./img/vanityResponse_Contact_Flow.png)





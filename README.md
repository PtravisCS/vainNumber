## vainNumber ##

AWS lambda function to convert a phone number to vanity numbers.
This program is triggered by an Amazon Connect Flow and takes the phone number field from the Connect call.
This data is then processed to find a list of possible words that would match the phone number.
Finally this data is written out to a dynamoDB table before being returned to the Connect Flow.

Code can be tested by calling +1-877-375-1213

### Assumptions ##

* The program is only designed to work for a U.S. 10 digit phone number, in theory it will work with longer or shorter phone numbers, but longer numbers will still only be tested for 10 digit or shorter words.

* The program only test for U.S. English words using a self modified varient of the Linux U.S. English dictionary.

* The program assumes that the vanity number with the most numbers replaced by the word is the best possible vanity number.
  
### Shortcuts ###

* The lambda function was provided with full access permissions to the DynamoDB database, in a real prod environment only the specifially needer permissions should be granted.
  The dictionary was prepared using a quick (and somewhat dirty) (helper program)[https://github.com/PtravisCS/dictionary_parser] I developed for purpose. 

* A single large try catch was used around the main body of code instead of more specific and meaningful try-catch statements.

* I didn't use typescript as I wasn't super familiar with it and didn't want to add an extra variable into the pot of things that needed to be learned while working on this project. Instead I used as psuedo-hungarian notation for my variable names to help make up for this.

* Attempts are made to fit only one word into the given phone number instead of recursively testing phone numbers to see if more words can be fit in.

### Difficulties ###

* I had some reasonable difficulties when I tried to convert from raw text output to SSML. This was caused by a combination of issues with both my lambda and with the setup of the flow.

* Further difficulties were encountered while setting up the lambda to read/write from/to the DynamoDB instance. This was caused by a need to grant permissions to the Lambda for accessing the DB and because the AWS code expects to be called ssynchronously and I had been doing synchronous calls.

* Initial account setup for AWS was a bit of a struggle as I spent around 2 - 3 days getting my credit card to allow the AWS transaction to go through and for AWS to accept my card.
  This was resolved by several phone calls to my credit card company.

* There was also a bit of a learning curve to familiarize myself with AWS systems and how to get these systems to interoperate.
  This was resolved by a combination of reading through the documentation and poking around AWS itself.

### Reasoning ###





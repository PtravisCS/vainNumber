#!/bin/bash

rm -f ./vainNumber.zip
zip -r vainNumber.zip ./* -x ./upload.bash

aws lambda update-function-code --function-name convert_to_vanity_number --zip-file fileb://vainNumber.zip

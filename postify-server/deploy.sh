#!/bin/bash

echo What should the version be?
read VERSION

docker build -t aryanshah791/postify:$VERSION .
docker push aryanshah791/postify:$VERSION
ssh aryanshah@45.76.1.176 "sudo -S docker pull aryanshah791/postify:$VERSION && sudo -S docker tag aryanshah791/postify:$VERSION dokku/postify-server:$VERSION && sudo -S dokku deploy postify-server $VERSION"
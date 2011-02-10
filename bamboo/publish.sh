#!/bin/bash

if [[ `hostname` = 'bh1-autobuild' ]]; then
  pfexec mkdir -p $PUBLISH_LOCATION
  pfexec cp provisioner.tgz $PUBLISH_LOCATION/$PKG
else
  echo scp
fi

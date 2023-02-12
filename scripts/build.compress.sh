#!/usr/bin/env bash

find build/ -type f | xargs -I{} gzip -fnk "{}"
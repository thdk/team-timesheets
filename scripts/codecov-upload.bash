#!/bin/bash
echo "Commit $2 on branch $3"
bash <(curl -s https://codecov.io/bash) -t $1 -C $2 -B $3
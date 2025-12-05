#!/bin/bash

source ../../../.env

bash ./drop_all_fns.sh

echo ""

for fn in "../functions/api/"*.sql "../functions/auth/"*.sql; do
    _NAME=$(basename "$fn" .sql)
    _DIR=$(basename "$(dirname "$fn")")
    echo "$_DIR.$_NAME"
    psql -U "$USER" -d "$DB" -f $fn
done

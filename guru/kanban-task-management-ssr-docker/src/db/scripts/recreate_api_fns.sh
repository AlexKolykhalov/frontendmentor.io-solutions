#!/bin/bash

source ../../../.env

bash ./drop_api_fns.sh

echo ""

for fn in "../functions/api/"*.sql; do
    _NAME=$(basename "$fn" .sql)
    echo "$_NAME"
    psql -U "$USER" -d "$DB" -f $fn
done


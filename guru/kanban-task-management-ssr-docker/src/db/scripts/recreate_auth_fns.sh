#!/bin/bash

source ../../../.env

bash ./drop_auth_fns.sh

echo ""

for fn in "../functions/auth/"*.sql; do
    _NAME=$(basename "$fn" .sql)
    echo "$_NAME"
    psql -U "$USER" -d "$DB" -f $fn
done


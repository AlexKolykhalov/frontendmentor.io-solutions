#!/bin/bash

source ../../../.env

for fn in "../functions/api/"*.sql; do
    _NAME=$(basename "$fn" .sql)
    echo "api.$_NAME"
    psql -U "$USER" -d "$DB" -c "drop function if exists api.$_NAME;"
done

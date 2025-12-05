#!/bin/bash

source ../../../.env

for fn in "../functions/auth/"*.sql; do
    _NAME=$(basename "$fn" .sql)
    echo "auth.$_NAME"
    psql -U "$USER" -d "$DB" -c "drop function if exists auth.$_NAME;"
done

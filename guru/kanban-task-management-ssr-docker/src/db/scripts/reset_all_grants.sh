#!/bin/bash

source ../../../.env

for fn in "../grants/"*.sql; do    
    _NAME=$(basename "$fn" .sql)
    echo "** $_NAME **"
    psql -U "$USER" -d "$DB" -f $fn
done

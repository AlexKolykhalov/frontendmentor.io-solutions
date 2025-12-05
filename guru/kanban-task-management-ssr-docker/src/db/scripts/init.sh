#!/bin/bash

_DB="$POSTGRES_DB"
_USER="$POSTGRES_USER"
_PATH="/docker-entrypoint-initdb.d/db"

# create roles
echo -e "\n**** ROLES ****\n"
psql -v PGRST_AUTHENTICATOR_ROLE="$PGRST_AUTHENTICATOR_ROLE" \
     -v PGRST_AUTHENTICATOR_PASSWORD="$PGRST_AUTHENTICATOR_PASSWORD" \
     -U "$_USER" \
     -d "$_DB" \
     -f "$_PATH/roles.sql"
# create schemes
echo -e "\n**** SCHEMES ****\n"
psql -U "$_USER" -d "$_DB" -f "$_PATH/schemes.sql"
# create extensions
echo -e "\n**** EXTENSIONS ****\n"
psql -U "$_USER" -d "$_DB" -f "$_PATH/extentions.sql"
# create tables (auth first)
echo -e "\n**** TABLES ****\n"
psql -U "$_USER" -d "$_DB" -f "$_PATH/tables/auth.sql"
psql -U "$_USER" -d "$_DB" -f "$_PATH/tables/api.sql"
# create functions
echo -e "\n**** FUNCTIONS ****\n"
for fn in "$_PATH/functions/api/"*.sql "$_PATH/functions/auth/"*.sql; do
    _NAME=$(basename "$fn" .sql)
    _DIR=$(basename "$(dirname "$fn")")
    echo "$_DIR.$_NAME"
    psql -U "$_USER" -d "$_DB" -f $fn
done
# set grants
echo -e "\n**** GRANTS ****\n"
for fn in "$_PATH/grants/"*.sql; do
    _NAME=$(basename "$fn" .sql)
    echo "** $_NAME **"
    psql -U "$_USER" -d "$_DB" -f $fn
done
# seed
echo -e "\n**** SEED ****\n"
# create default user
psql -U "$_USER" \
     -d "$_DB" \
     -c "
         insert into auth.users(user_id, login, password)
         values(
           '00000000-0000-0000-0000-000000000000',
           '$DEFAULT_USER_LOGIN',
           auth.crypt('$DEFAULT_USER_PASSWORD', (select auth.gen_salt('bf')))
         );
        "
psql -U "$_USER" \
     -d "$_DB" \
     -f "$_PATH/seed.sql"

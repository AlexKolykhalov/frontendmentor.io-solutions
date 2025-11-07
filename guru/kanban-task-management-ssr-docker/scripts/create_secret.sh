# bash create_secret.sh --- created "jwt-secret" in postgrest.conf (32 symbols or more)

export LC_CTYPE=C
echo "jwt-secret = \"$(< /dev/urandom tr -dc A-Za-z0-9 | head -c32)\"" >> postgrest.conf

#!/bin/bash

source ../../../.env

COOKIE_NAME="session-uuid"

FAKE_UUID=00000000-0000-0000-0000-000000000000
FAKE_AUTH_LOGIN="test_user"
FAKE_AUTH_PASSWORD="test_user"

##########################################

function delete_sessions() {
    psql -U "$USER" \
	 -d "$DB" \
	 -q \
	 -c "delete from auth.sessions where user_id=(select user_id from auth.users where login='test_user'); \
             delete from auth.sessions where user_id=(select user_id from auth.users where login='anonymous');"

    echo "[INFO] sessions of \"anonymous\" has been deleted"
    echo "[INFO] sessions of \"test_user\" has been deleted"
}

function transform_response() {
    NO_PAYLOAD=false
    for arg in "$@"; do
	if [[ "$arg" == "--no-payload" ]]; then
	    NO_PAYLOAD=true
	fi
    done

    INFO=$(echo "$1" | grep "HTTP" | sed 's/[^a-zA-Z0-9 ]//g' | awk '{for(i=2; i<=NF; i++) {if (i<NF) {printf "%s ", $i} else {printf "%s", $i}}}')
    CODE=$(echo "$INFO" | awk '{print $1}')
    if [[ "$CODE" == 200 || "$CODE" == 201 || "$CODE" == 204 ]]; then
	echo "$INFO $([[ "$NO_PAYLOAD" == false ]] && echo "$(echo "$1" | grep "{")" || echo "")"
    else
	echo "$INFO ($(echo "$1" | grep "{" | jq -r '.message'))"
    fi
}

function api_post_fn() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --name=*)
                NAME="${1#*=}"
                shift
                ;;
            --payload=*)
                PAYLOAD="${1#*=}"
                shift
                ;;
	    --token=*)
                TOKEN="${1#*=}"
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    echo "$(curl -i \
		 -s \
		 -H "Content-Profile: api" \
		 -H "Content-Type:application/json" \
		 -H "Authorization: Bearer $TOKEN" \
		 -d "$PAYLOAD" \
		 http://localhost:4000/rpc/$NAME)"
}

function api_get_fn() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --name=*)
                NAME="${1#*=}"
                shift
                ;;
            --params=*)
                PARAMS="${1#*=}"
                shift
                ;;
	    --token=*)
                TOKEN="${1#*=}"
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    echo "$(curl -i \
		 -s \
		 -H "Content-Profile: api" \
		 -H "Authorization: Bearer $TOKEN" \
		 http://localhost:4000/rpc/$NAME?$PARAMS)"
}

function auth_post_fn() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --name=*)
                NAME="${1#*=}"
                shift
                ;;
            --payload=*)
                PAYLOAD="${1#*=}"
                shift
                ;;
	    --token=*)
                TOKEN="${1#*=}"
                shift
                ;;
	    --cookie=*)
                COOKIE="${1#*=}"
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    echo "$(curl -i \
		 -s \
		 -X POST \
		 -H "Content-Profile: auth" \
		 -H "Content-Type:application/json" \
		 -H "Authorization: Bearer $TOKEN" \
		 -b "$COOKIE" \
		 -d "$PAYLOAD" \
	         http://localhost:4000/rpc/$NAME)"
}

##########################################

echo -e "\n========= AUTHENTICATION ===========\n"
echo "**** Guest ****"

# SIGNUP
RESPONSE=$(auth_post_fn \
	       --name="signup" \
	       --payload="{\"p_login\": \"$ANONYMOUS_LOGIN\", \"p_password\": \"$ANONYMOUS_PASSWORD\"}")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 409 ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signup (anon) | $INFO"

RESPONSE=$(auth_post_fn \
	       --name="signup" \
	       --payload="{\"p_login\": \"$FAKE_AUTH_LOGIN\", \"p_password\": \"$FAKE_AUTH_PASSWORD\"}")
INFO=$(transform_response "$RESPONSE")
if [[ $(echo "$INFO" | awk '{print $1}') == 200 ]]; then
    AUTH_SIGNUP_SESSION=$(echo "$INFO" | awk '{print $6}' | sed 's/[^a-zA-Z0-9-]//g')
    echo "[v] /rpc/signup (auth) | $(echo "$INFO" | awk '{print $1, $2}')"
else
    echo "[ ] /rpc/signup (auth) | $INFO"
fi

# SIGNIN
RESPONSE=$(auth_post_fn \
	       --name="signin" \
	       --payload="{\"p_login\": \"$ANONYMOUS_LOGIN\", \"p_password\": \"$ANONYMOUS_PASSWORD\"}")
INFO=$(transform_response "$RESPONSE")
if [[ $(echo "$INFO" | awk '{print $1}') == 200 ]]; then
    ANON_SESSION=$(echo "$INFO" | awk '{print $6}' | sed 's/[^a-zA-Z0-9-]//g')
    ANON_TOKEN=$(echo "$INFO" | awk '{print $4}' | sed 's/[",]//g')    
    echo "[v] /rpc/signin (anon) | $(echo "$INFO" | awk '{print $1, $2}')"
else
    echo "[ ] /rpc/signin (anon) | $INFO"
fi

RESPONSE=$(auth_post_fn \
	       --name="signin" \
	       --payload="{\"p_login\": \"$FAKE_AUTH_LOGIN\", \"p_password\": \"$FAKE_AUTH_PASSWORD\"}")
INFO=$(transform_response "$RESPONSE")
if [[ $(echo "$INFO" | awk '{print $1}') == 200 ]]; then
    AUTH_SESSION=$(echo "$INFO" | awk '{print $6}' | sed 's/[^a-zA-Z0-9-]//g')
    AUTH_TOKEN=$(echo "$INFO" | awk '{print $4}' | sed 's/[",]//g')    
    echo "[v] /rpc/signin (auth) | $(echo "$INFO" | awk '{print $1, $2}')"
else
    echo "[ ] /rpc/signin (auth) | $INFO"
fi

# SIGNOUT
RESPONSE=$(auth_post_fn --name="signout")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signout (without session token) | $INFO"

RESPONSE=$(auth_post_fn --name="signout" --cookie="$COOKIE_NAME=$ANON_SESSION")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signout (with anon session token) | $INFO"

RESPONSE=$(auth_post_fn --name="signout" --cookie="$COOKIE_NAME=$AUTH_SESSION")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signout (with auth session token) | $INFO"

# GENERATE_AUTHZ_TOKEN
RESPONSE=$(auth_post_fn --name="generate_authz_token")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/generate_authz_token (without session token) | $INFO"

RESPONSE=$(auth_post_fn --name="generate_authz_token" --cookie="$COOKIE_NAME=$FAKE_UUID")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/generate_authz_token (invalid session token) | $INFO"

RESPONSE=$(auth_post_fn --name="generate_authz_token" --cookie="$COOKIE_NAME=fake")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 400 ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/generate_authz_token (invalid UUID) | $INFO"

RESPONSE=$(auth_post_fn --name="generate_authz_token" --cookie="$COOKIE_NAME=$ANON_SESSION")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/generate_authz_token (with anon session token) | $INFO"

RESPONSE=$(auth_post_fn --name="generate_authz_token" --cookie="$COOKIE_NAME=$AUTH_SESSION")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/generate_authz_token (with auth session token) | $INFO"

echo -e "\n**** Anonymous ****"
# SIGNUP
RESPONSE=$(auth_post_fn \
	       --name="signup" \
	       --payload="{\"p_login\": \"$ANONYMOUS_LOGIN\", \"p_password\": \"$ANONYMOUS_PASSWORD\"}" \
	       --token="$ANON_TOKEN")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signup | $INFO"

# SIGNIN
RESPONSE=$(auth_post_fn \
	       --name="signin" \
	       --payload="{\"p_login\": \"$ANONYMOUS_LOGIN\", \"p_password\": \"$ANONYMOUS_PASSWORD\"}" \
	       --token="$ANON_TOKEN")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signin | $INFO"

# SIGNOUT
RESPONSE=$(auth_post_fn --name="signout" --token="$ANON_TOKEN" --cookie="$COOKIE_NAME=$ANON_SESSION")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 204 ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signout | $INFO"

# GENERATE_AUTHZ_TOKEN
RESPONSE=$(auth_post_fn --name="generate_authz_token" --token="$ANON_TOKEN")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/generate_authz_token | $INFO"

echo -e "\n**** Auth ****"
# SIGNUP
RESPONSE=$(auth_post_fn \
	       --name="signup" \
	       --payload="{\"p_login\": \"$FAKE_AUTH_LOGIN\", \"p_password\": \"$FAKE_AUTH_PASSWORD\"}" \
	       --token="$AUTH_TOKEN")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signup | $INFO"

# SIGNIN
RESPONSE=$(auth_post_fn \
	       --name="signin" \
	       --payload="{\"p_login\": \"$FAKE_AUTH_LOGIN\", \"p_password\": \"$FAKE_AUTH_PASSWORD\"}" \
	       --token="$AUTH_TOKEN")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signin | $INFO"

# SIGNOUT (after signup)
RESPONSE=$(auth_post_fn --name="signout" --token="$AUTH_TOKEN" --cookie="$COOKIE_NAME=$AUTH_SIGNUP_SESSION")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 204 ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signout(after signup) | $INFO"

# SIGNOUT (after signin)
RESPONSE=$(auth_post_fn --name="signout" --token="$AUTH_TOKEN" --cookie="$COOKIE_NAME=$AUTH_SESSION")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 204 ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/signout(after signin) | $INFO"

# GENERATE_AUTHZ_TOKEN
RESPONSE=$(auth_post_fn --name="generate_authz_token" --token="$AUTH_TOKEN")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/generate_authz_token | $INFO"

# echo -e "\n========= API ===========\n"
# echo "**** Guest ****"
# # create_board
# RESPONSE=$(api_post_fn --name="create_board")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == "permission denied for schema api" ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/create_board | $INFO"

# # get_board
# RESPONSE=$(api_get_fn --name="get_board" --params="p_board_id=$FAKE_UUID")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == "permission denied for schema api" ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/get_board | $INFO"

# # update_board
# RESPONSE=$(api_post_fn --name="update_board")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == "permission denied for schema api" ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/update_board | $INFO"

# # delete_board
# RESPONSE=$(api_post_fn --name="delete_board" --payload="{\"p_id\": \"$FAKE_UUID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == "permission denied for schema api" ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/delete_board | $INFO"

# # create_task
# RESPONSE=$(api_post_fn --name="create_task" --payload="{\"p_task\": {\"title\":\"task_test\", \"description\":\"description_test\", \"subtasks\":[{\"title\":\"subtask_test\"}]}, \"p_column_id\":\"$FAKE_UUID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == "permission denied for schema api" ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/create_task | $INFO"

# # get_task
# RESPONSE=$(api_get_fn --name="get_task" --params="p_task_id=$FAKE_UUID")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == "permission denied for schema api" ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/get_task | $INFO"

# # update_task
# RESPONSE=$(api_post_fn --name="update_task" --payload="{\"p_task\": {\"id\":\"$FAKE_UUID\", \"title\":\"task_test_updated\", \"description\":\"description_test_updated\", \"subtasks\":[{\"id\":\"$FAKE_UUID\", \"title\":\"subtask_test_updated\"}]}, \"p_column_id\":\"$FAKE_UUID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == "permission denied for schema api" ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/update_task | $INFO"

# # update_task_column_id
# RESPONSE=$(api_post_fn --name="update_task_column_id" --payload="{\"p_task_id\":\"$FAKE_UUID\", \"p_column_id\":\"$FAKE_UUID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == "permission denied for schema api" ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/update_task_column_id | $INFO"

# # delete_task
# RESPONSE=$(api_post_fn --name="delete_task" --payload="{\"p_id\": \"$FAKE_UUID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == "permission denied for schema api" ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/delete_task | $INFO"

# # get_boards
# RESPONSE=$(api_get_fn --name="get_boards")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == "permission denied for schema api" ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/get_boards | $INFO"

# echo -e "\n**** Anonymous ****"
# # create_board
# RESPONSE=$(api_post_fn --name="create_board" --token="$ANON_TOKEN" --payload="{\"p_board\": {\"name\":\"board_test\", \"columns\":[{\"name\":\"column_test\"}]}}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/create_board | $INFO"

# # get_board
# BOARD_ID=$(psql -U "$USER" \
# 		-d "$DB" \
# 		-h "$HOST" \
# 		-p "$PORT" \
# 		-q \
# 		-t \
# 		-c "select board_id from api.boards where user_id=(select user_id from auth.users where login='anonymous') order by created_at limit 1;" | sed 's/[ ]//g' )

# RESPONSE=$(api_get_fn --name="get_board" --token="$ANON_TOKEN" --params="p_board_id=$BOARD_ID")
# INFO=$(transform_response "$RESPONSE" --no-payload)
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/get_board | $INFO"

# # update_board
# RESPONSE=$(api_post_fn --name="update_board" --token="$ANON_TOKEN" --payload="{\"p_board\": {\"id\":\"$FAKE_UUID\", \"name\":\"board_test_updated\", \"columns\":[{\"id\":\"$FAKE_UUID\", \"name\":\"column_test_updated\"}]}}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/update_board | $INFO"

# # delete_board
# RESPONSE=$(api_post_fn --name="delete_board" --token="$ANON_TOKEN" --payload="{\"p_id\": \"$FAKE_UUID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/delete_board | $INFO"

# # create_task
# RESPONSE=$(api_post_fn --name="create_task" --token="$ANON_TOKEN" --payload="{\"p_task\": {\"title\":\"task_test\", \"description\":\"description_test\", \"subtasks\":[{\"title\":\"subtask_test\"}]}, \"p_column_id\":\"$FAKE_UUID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/create_task | $INFO"

# # get_task
# TASK_ID=$(psql -U "$USER" \
# 		-d "$DB" \
# 		-h "$HOST" \
# 		-p "$PORT" \
# 		-q \
# 		-t \
# 		-c "select task_id from api.tasks where user_id=(select user_id from auth.users where login='anonymous') order by created_at limit 1;" | sed 's/[ ]//g' )

# RESPONSE=$(api_get_fn --name="get_task" --token="$ANON_TOKEN" --params="p_task_id=$TASK_ID")
# INFO=$(transform_response "$RESPONSE" --no-payload)
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/get_task | $INFO"

# # update_task
# RESPONSE=$(api_post_fn --name="update_task" --token="$ANON_TOKEN" --payload="{\"p_task\": {\"id\":\"$FAKE_UUID\", \"title\":\"task_test_updated\", \"description\":\"description_test_updated\", \"subtasks\":[{\"id\":\"$FAKE_UUID\", \"title\":\"subtask_test_updated\"}]}, \"p_column_id\":\"$FAKE_UUID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/update_task | $INFO"

# # update_task_column_id
# RESPONSE=$(api_post_fn --name="update_task_column_id" --token="$ANON_TOKEN" --payload="{\"p_task_id\":\"$FAKE_UUID\", \"p_column_id\":\"$FAKE_UUID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/update_task_column_id | $INFO"

# # delete_task
# RESPONSE=$(api_post_fn --name="delete_task" --token="$ANON_TOKEN" --payload="{\"p_id\": \"$FAKE_UUID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/delete_task | $INFO"

# # get_boards
# RESPONSE=$(api_get_fn --name="get_boards" --token="$ANON_TOKEN")
# INFO=$(transform_response "$RESPONSE" --no-payload)
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/get_boards | $INFO"

# echo -e "\n**** Auth ****"
# # create_board
# RESPONSE=$(api_post_fn --name="create_board" --token="$AUTH_TOKEN" --payload="{\"p_board\": {\"name\":\"board_test\", \"columns\":[{\"name\":\"column_test\"}]}}")
# INFO=$(transform_response "$RESPONSE" --no-payload)
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/create_board | $INFO"

# # get_board
# BOARD_ID=$(psql -U "$USER" \
# 		-d "$DB" \
# 		-h "$HOST" \
# 		-p "$PORT" \
# 		-q \
# 		-t \
# 		-c "select board_id from api.boards where user_id=(select user_id from auth.users where login='test_user') and name='board_test';" | sed 's/[ ]//g' )

# RESPONSE=$(api_get_fn --name="get_board" --token="$AUTH_TOKEN" --params="p_board_id=$BOARD_ID")
# INFO=$(transform_response "$RESPONSE" --no-payload)
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/get_board | $INFO"

# # update_board
# COLUMN_ID=$(psql -U "$USER" \
# 		 -d "$DB" \
# 		 -h "$HOST" \
# 		 -p "$PORT" \
# 		 -q \
# 		 -t \
# 		 -c "select column_id from api.columns where user_id=(select user_id from auth.users where login='test_user') and name='column_test';" | sed 's/[ ]//g' )

# RESPONSE=$(api_post_fn --name="update_board" --token="$AUTH_TOKEN" --payload="{\"p_board\": {\"id\":\"$BOARD_ID\", \"name\":\"board_test_updated\", \"columns\":[{\"id\":\"$COLUMN_ID\", \"name\":\"column_test_updated\"}]}}")
# INFO=$(transform_response "$RESPONSE" --no-payload)
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/update_board | $INFO"

# # create_task
# RESPONSE=$(api_post_fn --name="create_task" --token="$AUTH_TOKEN" --payload="{\"p_task\": {\"title\":\"task_test\", \"description\":\"description_test\", \"subtasks\":[{\"title\":\"subtask_test\"}]}, \"p_column_id\":\"$COLUMN_ID\"}")
# INFO=$(transform_response "$RESPONSE" --no-payload)
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/create_task | $INFO"

# # get_task
# TASK_ID=$(psql -U "$USER" \
# 		-d "$DB" \
# 		-h "$HOST" \
# 		-p "$PORT" \
# 		-q \
# 		-t \
# 		-c "select task_id from api.tasks where user_id=(select user_id from auth.users where login='test_user');" | sed 's/[ ]//g' )

# RESPONSE=$(api_get_fn --name="get_task" --token="$AUTH_TOKEN" --params="p_task_id=$TASK_ID")
# INFO=$(transform_response "$RESPONSE" --no-payload)
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/get_task | $INFO"

# # update_task
# SUBTASK_ID=$(psql -U "$USER" \
# 	       -d "$DB" \
# 	       -h "$HOST" \
# 	       -p "$PORT" \
# 	       -q \
# 	       -t \
# 	       -c "select subtask_id from api.subtasks where user_id=(select user_id from auth.users where login='test_user');" | sed 's/[ ]//g' )

# RESPONSE=$(api_post_fn --name="update_task" --token="$AUTH_TOKEN" --payload="{\"p_task\": {\"id\":\"$TASK_ID\", \"title\":\"task_test_updated\", \"description\":\"description_test_updated\", \"subtasks\":[{\"id\":\"$SUBTASK_ID\", \"title\":\"subtask_test_updated\", \"isCompleted\":true}]}, \"p_column_id\":\"$COLUMN_ID\"}")
# INFO=$(transform_response "$RESPONSE" --no-payload)
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/update_task | $INFO"

# # update_task_column_id
# RESPONSE=$(api_post_fn --name="update_task_column_id" --token="$AUTH_TOKEN" --payload="{\"p_task_id\":\"$TASK_ID\", \"p_column_id\":\"$COLUMN_ID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 204 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/update_task_column_id | $INFO"

# # get_boards
# RESPONSE=$(api_get_fn --name="get_boards" --token="$AUTH_TOKEN")
# INFO=$(transform_response "$RESPONSE" --no-payload)
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 200 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/get_boards | $INFO"

# # delete_task
# RESPONSE=$(api_post_fn --name="delete_task" --token="$AUTH_TOKEN" --payload="{\"p_id\": \"$TASK_ID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 204 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/delete_task | $INFO"

# # delete_board
# RESPONSE=$(api_post_fn --name="delete_board" --token="$AUTH_TOKEN" --payload="{\"p_id\": \"$BOARD_ID\"}")
# INFO=$(transform_response "$RESPONSE")
# PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 204 ]] && echo "[v]" || echo "[ ]")
# echo "$PASS_STATUS /rpc/delete_board | $INFO"

echo ""
# delete_board (by guest)
RESPONSE=$(auth_post_fn --name="delete_user")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 401 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/delete_user (guest) | $INFO"

# delete_board (by anonymous)
RESPONSE=$(auth_post_fn --name="delete_user" --token="$ANON_TOKEN")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 403 && $(echo "$INFO" | awk -F'[()]' '{print $2}') == *"permission denied for function"* ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/delete_user (anon) | $INFO"

# delete_board (by auth)
RESPONSE=$(auth_post_fn --name="delete_user" --token="$AUTH_TOKEN")
INFO=$(transform_response "$RESPONSE")
PASS_STATUS=$([[ $(echo "$INFO" | awk '{print $1}') == 204 ]] && echo "[v]" || echo "[ ]")
echo "$PASS_STATUS /rpc/delete_user (auth) | $INFO"

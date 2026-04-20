import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from .models import LibraryEntry
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login

@require_GET
def health(request):
    return JsonResponse({"status": "0ok"})

## Error function
def error(details):
    return JsonResponse({
        "error": "validation_error",
        "message": "wrong data introduced",
        "details": { "field" : details }
    }, status = 400)

# We make a function to refer to any game that alreaddy exists in the DB.
def duplicated_error(details):
    return JsonResponse({
        "error": "duplicate_entry",
        "message": "That info already exists",
        "details": { details: "duplicate"}
    }, status = 400)

# We add a game to the program.
@csrf_exempt
def add_game(request):

    if not request.user.is_authenticated:
        return error("user does not exists")

    if request.method == "POST":
        # get all data
        data = json.loads(request.body)

        # Assiing the data to a variable 
        external_game_id = data.get("external_game_id")
        status = data.get("status")
        hours_played = data.get("hours_played")
        user = data.get("user")
        
        #Check if the id is in correct format and catch the exception.
        try:
            if not (isinstance(external_game_id, str)):
                return error("Invalid id")
            if LibraryEntry.objects.filter(external_game_id = external_game_id).exists():
                return duplicated_error("Id already exists")
            if external_game_id == "":
                return error("Not allowed null values")
        except Exception as e:
            JsonResponse({
                "error": str(e)
            }, status = 400)
        #check if the status is in the correct format and catch the exception
        try:
            if not (status.lower() == "playing" or status.lower() == "completed" or status.lower() == "whishlist" or status.lower() == "dropped"):
                return error("Invalid status")
            if status == "":
                return error("Not allowed null values")
        except Exception as e:
            JsonResponse({
                "error": error(e)
            }, status = 400)
        
        #Check the hours played correct format and catch the exception
        try:
            hours_played = int(hours_played)
            if hours_played is None or str(hours_played) == "":
                return error("must be numbers")
            if hours_played < 0:
                raise ValueError
        except (TypeError, ValueError) as e:
            return JsonResponse({
                "error": str(e)
            }, status=400)
        
        try:
            if not (isinstance(user, str)):
                return error("Invalid user")
            if user == "":
                return error("Not allowed null values")
        except Exception as e:
            JsonResponse({
                "error": str(e)
            }, status = 401)

        #to create a dictionary and finaly show it 
        entry = LibraryEntry.objects.create(
            external_game_id = external_game_id,
            status = status.lower(),
            hours_played = hours_played,
            user = request.user
        )

        # The JSON response to show the info.
        return JsonResponse({
            "id": entry.external_game_id,
            "status": entry.status,
            "hours_playes": entry.hours_played,
            "user": entry.user.username
        }, status = 201)
    

    # List all games
    if request.method == "GET":

        entry = LibraryEntry.objects.all()

        d_games = list(entry.values(
            "external_game_id",
            "status",
            "hours_played",
            "user"
        ))
        return JsonResponse(d_games, safe=False)

@csrf_exempt
def get_id_game(request, id):

    entry = LibraryEntry.objects.get(id=id)
    
    #Get an specific info form a certain id
    if request.method == "GET":
        if entry is None:
            return JsonResponse({
                "error": "not_found",
                "message": "The ID does not exists"
            }, status = 404)
        return JsonResponse(entry, safe=False)
    
    # Update the data for a certain id.
    if request.method == "PATCH":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                "error": "invalid_json",
            "message": "Body is not valid JSON"
            }, status=400)
        
        try:
            request.user.is_authenticated
        except AttributeError:
            return JsonResponse({
                "error": "user_not_authenticated",
                "message": "User is not authenticated"
            }, status=404)
        
        if "status" in data:
            entry.status = data["status"]

        if "hours_played" in data:
            entry.hours_played = data["hours_played"]

        entry.save()

        return JsonResponse({
            "message": "update",
            "id": entry.external_game_id,
            "status": entry.status,
            "hours_played": entry.hours_played,
            "user": entry.user.username
        }, status = 200)
    
@csrf_exempt
def add_user(request):

    if request.method == "POST":
        data = json.loads(request.body)
        user = data.get("user")
        password = data.get("password")
        
        try:
            if not (isinstance(user, str)):
                return duplicated_error("user already exists")
        except Exception as e:
                return JsonResponse({
                    "error": str(e)
                }, status = 400)
        
        try:
            if not (isinstance(password, str)):
                return error("invalid password")
        except Exception as e:
            return JsonResponse({
                "error": str(e)
            }, status = 403)
        
        User = get_user_model()
        try:
            new_user = User.objects.create_user(
                username=user,
                password=password
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
        
        return JsonResponse({
            "message": "user created",
            "username": new_user.username
        }, status = 201)

@csrf_exempt
def verify_user(request):

    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get("user")
        password = data.get("password")
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    user = authenticate(request, username=username, password=password)

    if user is None:
        return JsonResponse({
            "error": "invalid_credentials",
            "message": "User or password incorrect"
        }, status=401)

    login(request, user)

    return JsonResponse({
        "message": "login successful",
        "username": user.username
    }, status=200)

    
def me(request):

    if request.method != "GET":
        return JsonResponse({"error": "Only GET allowed"}, status = 405)
    
    if not request.user.is_authenticated:
        return error("user does not exists")

    user = request.user
    return JsonResponse({
        "id": user.id,
        "username": user.username
    })


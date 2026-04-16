import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from .models import LibraryEntry

@require_GET
def health(request):
    return JsonResponse({"status": "ok"})

## Error function
def error(details):
    return JsonResponse({
        "error": "validation_error",
        "message": "Invalid data introduced",
        "details": { "field" : details }
    }, status = 400)

# We make a function to refer to any game that alreaddy exists in the DB.
def duplicated_error(details):
    return JsonResponse({
        "error": "duplicate_entry",
        "message": "That game already exists",
        "details": { details: "duplicate"}
    })

# We add a game to the program.
@csrf_exempt
def add_game(request):

    if request.method == "POST":
        # get all data
        data = json.loads(request.body)

        # Assiing the data to a variable 
        external_game_id = data.get("external_game_id")
        status = data.get("status")
        hours_played = data.get("hours_played")
        
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
                "error": str(e)
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
        
        #to create a dictionary and finaly show it 
        entry = LibraryEntry.objects.create(
            external_game_id = external_game_id,
            status = status.lower(),
            hours_played = hours_played
        )

        # The JSON response to show the info.
        return JsonResponse({
            "id": entry.external_game_id,
            "status": entry.status,
            "hours_playes": entry.hours_played
        }, status = 201)
    
    # List all games
    if request.method == "GET":
        entry = LibraryEntry.objects.all()

        d_games = list(entry.values(
            "external_game_id",
            "status",
            "hours_played"
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
        
        if "status" in data:
            entry.status = data["status"]

        if "hours_played" in data:
            entry.hours_played = data["hours_played"]

        entry.save()

        return JsonResponse({
            "message": "update",
            "id": entry.external_game_id,
            "status": entry.status,
            "hours_played": entry.hours_played
        }, status = 200)
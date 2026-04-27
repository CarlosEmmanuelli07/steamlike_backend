import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from .models import LibraryEntry
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from .utils import error, duplicated_error, error401, error403, error404, error500, okey201, okey200, error400
from django.shortcuts import render
# Create your views here.
@require_GET
def health(request):
    return JsonResponse({"status": "ok"})

def home(request):
    return render(request, "home.html")

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
            return error400(str(e))
        #check if the status is in the correct format and catch the exception
        try:
            if not (status.lower() == "playing" or status.lower() == "completed" or status.lower() == "whishlist" or status.lower() == "dropped"):
                return error("Invalid status")
            if status == "":
                return error("Not allowed null values")
        except Exception as e:
            return error400(str(e))
        
        #Check the hours played correct format and catch the exception
        try:
            hours_played = int(hours_played)
            if hours_played is None or str(hours_played) == "":
                return error("must be numbers")
            if hours_played < 0:
                raise ValueError
        except (TypeError, ValueError) as e:
            return error400(str(e))
        
        try:
            if not (isinstance(user, str)):
                return error("Invalid user")
            if user == "":
                return error("Not allowed null values")
        except Exception as e:
            return error401(str(e))

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

        entry = LibraryEntry.objects.filter(user=request.user)

        d_games = list(entry.values(
            "id",
            "external_game_id",
            "status",
            "hours_played",
            "user"
        ))
        return JsonResponse(d_games, safe=False)

@csrf_exempt
def get_id_game(request, id):
    
    if not request.user.is_authenticated:
        return error401("user does not exists")
    
    entry = LibraryEntry.objects.filter(user=request.user, id=id).first()

    if entry is None:
        return error404("The ID does not exists")
    
    #Get an specific info form a certain id
    if request.method == "GET":
        if entry is None:
            return error404("user does not exists")
        return JsonResponse({
            "id": entry.id,
            "external_game_id": entry.external_game_id,
            "status": entry.status,
            "hours_played": entry.hours_played
        }, safe=False)
    
    # Update the data for a certain id.
    if request.method == "PATCH":

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return error400("Invalid JSON format")
            
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
    
    # Update full data for a certain id.
    if request.method == "PUT":

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return error400("Invalid JSON format")
            
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
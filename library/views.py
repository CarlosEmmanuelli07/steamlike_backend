import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from .models import LibraryEntry
from django.shortcuts import render
from .utils import error, duplicated_error, error401, error403, error404, error400, error502
import requests
# Create your views here.
@require_GET
def health(request):
    return JsonResponse({"status": "ok"})

""" Views for the library app. """
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
        user = request.user
        
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
            if not (status.lower() == "playing" or status.lower() == "completed" or status.lower() == "wishlist" or status.lower() == "dropped"):
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
    

@require_GET
def catalog_search(request):
    q = request.GET.get("q")

    if not q or q.strip() == "":
        return error400("Query parameter 'q' is required and cannot be empty")
    # Simulate a search in the catalog (replace with actual search logic)
    response = requests.get(
        "https://www.cheapshark.com/api/1.0/games",
        params={"title": q}
    )

    if response.status_code != 200:
        return error502("Failed to fetch data from external API")

    data = response.json()

    result = []
    for game in data:
        result.append({
            "external_game_id": game.get("gameID"),
            "title": game.get("external"),
            "cheapest_price": game.get("cheapest"),
            "thumb": game.get("thumb"),
            "steam_link": f"https://store.steampowered.com/app/{game.get('gameID')}"
        })
    return JsonResponse(result, safe=False)

@csrf_exempt
def catalog_resolve(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return error400("Invalid JSON format")

        game_ids = data.get("external_game_id")

        if not game_ids:
            return error400("Game ID is required")

        if not isinstance(game_ids, list):
            game_ids = [game_ids]

        results = []

        for game_id in game_ids:
            response = requests.get(
                "https://www.cheapshark.com/api/1.0/games",
                params={"id": game_id},
                timeout=10
            )

            if response.status_code != 200:
                continue  # o guarda error si quieres

            game_data = response.json()
            game = game_data.get("info")

            if not game:
                continue

            results.append({
                "external_game_id": game_id,
                "title": game.get("title"),
                "thumb": game.get("thumb"),
                "steam_link": f"https://store.steampowered.com/app/{game_id}"
            })

        return JsonResponse(results, safe=False, status=200)
import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from library.models import LibraryEntry
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
# Create your views here.

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



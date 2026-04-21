import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from gunicorn.config import User
from library.models import LibraryEntry
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from .utils import error, duplicated_error, error401, error403, error404, error500, okey201, okey200, error400  
# Create your views here.

@csrf_exempt
def add_user(request):

    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return error400("invalid json")
        user = data.get("user")
        password = data.get("password")
        
        try:
            User = get_user_model()

            if User.objects.filter(username=user).exists():
                return duplicated_error("user already exists")
        except Exception as e:
                return JsonResponse({
                    "error": str(e)
                }, status = 400)
        
        try:
            if not (isinstance(password, str)):
                return error("invalid password")
        except Exception as e:
            return error403(str(e))
        
        User = get_user_model()
        try:
            new_user = User.objects.create_user(
                username=user,
                password=password
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
        
        return okey201("User created successfully")

@csrf_exempt
def verify_user(request):

    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return error400("invalid json")
        username = data.get("user")
        password = data.get("password")
    except Exception as e:
        return error400(str(e))

    user = authenticate(request, username=username, password=password)

    if user is None:
        return error401("Invalid credentials")
            

    login(request, user)

    return okey200("Login successful")

    
def me(request):

    if request.method != "GET":
        return JsonResponse({"error": "Only GET allowed"}, status = 405)
    
    if not request.user.is_authenticated:
        return error("user does not exists")

    user = request.user

    if request.method == "POST":
        data = json.loads(request.body)
        
        user.username = data.get("username", user.username)
        password = data.get("password")

        if isinstance(password, str) and len(password) >= 8:
            user.set_password(password)
        else:
            return error("invalid password")
        user.save()

    return JsonResponse({
        "id": user.id,
        "username": user.username
    }, status=200)

def logout_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    if not request.user.is_authenticated:
        return error("user does not exists")

    from django.contrib.auth import logout
    logout(request)
    return okey200("Logout successful")
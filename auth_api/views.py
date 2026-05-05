import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from gunicorn.config import User
from library.models import LibraryEntry
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login

from library.utils import error503
from .utils import error, duplicated_error, error401, error403, error404, error500, okey201, okey200, error400, error502
from django.contrib.auth import logout
import os
import requests
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
            return error401("invalid json")
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
        return JsonResponse({"error": "User not authenticated"}, status=401)

    user = request.user

    return JsonResponse({
        "id": user.id,
        "username": user.username
    }, status=200)

@csrf_exempt
def password_change(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if not request.user.is_authenticated:
            return error401("no authenticated")
        
        old_password = data.get("old_password")
        new_password = data.get("new_password")

        user = request.user
        if not user.check_password(old_password):
            return error401("Incorrect old password")
        
        if not isinstance(new_password, str) or len(new_password) < 8:
            return error400("New password must be a string with at least 8 characters")
            
        user.set_password(new_password)
        user.save()
        return okey200("Password updated successfully")

@csrf_exempt
def logout_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    if not request.user.is_authenticated:
        return error("user does not exists")

    logout(request)
    return okey200("Logout successful")

@csrf_exempt
@require_POST
def send_email(request):
    data = json.loads(request.body)
    to = data["to"]
    subject = data["subject"]
    text = data["text"]

    # Aquí iría la lógica para enviar el correo electrónico utilizando una biblioteca como smtplib o un servicio de terceros.
    headres = {
        "Authorization": f"Bearer {os.getenv('MAILEROO_TOKEN')}",
        "Content-Type": "application/json"
    }

    payload = {
        "from": {"address": os.getenv("MAILEROO_FROM_ADDRESS")},
        "to": [{"address": to}],
        "subject": subject,
        "text": text
    }

    try:    
        r = requests.post(os.getenv("MAILEROO_URL"), headers=headres, json=payload, timeout=5)
    except requests.RequestException as e:
        return error503(f"Failed to send email: {str(e)}")
    
    if r.status_code >= 400:
        return error502(f"Failed to send email: {r.text}")
    
    return okey200("Email sent successfully")

from django.http import JsonResponse

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

def error401(details):
    return JsonResponse({
        "error": "Unauthorized",
        "message": "Unauthorized",
        "details": { details: "Unauthorized"}
    }, status = 401)

def error403(details):
    return JsonResponse({
        "error": "Forbidden",
        "message": "Forbidden",
        "details": { details: "Forbidden"}
    }, status = 403)

def error404(details):
    return JsonResponse({
        "error": "Not Found",
        "message": "Not Found",
        "details": { details: "Not Found"}
    }, status = 404)

def error500(details):  
    return JsonResponse({
        "error": "Internal Server Error",
        "message": "Internal Server Error",
        "details": { details: "Internal Server Error"}
    }, status = 500)

def okey201(details):
    return JsonResponse({
        "message": "ok",
        "details": { details: "ok"}
    }, status = 201)

def okey200(details):
    return JsonResponse({
        "message": "ok",
        "details": { details: "ok"}
    }, status = 200)

def error400(details):
    return JsonResponse({
        "error": "Bad Request",
        "message": "Bad Request",
        "details": { details: "Bad Request"}
    }, status = 400)

def error502(details):
    return JsonResponse({
        "error": "Bad Gateway",
        "message": "Bad Gateway",
        "details": { details: "Bad Gateway"}
    }, status = 502)

def error503(details):
    return JsonResponse({
        "error": "Service Unavailable",
        "message": "Service Unavailable",
        "details": { details: "Service Unavailable"}
    }, status = 503)
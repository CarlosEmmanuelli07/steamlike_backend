from django.contrib import admin
from django.urls import path, include
from library.views import health
from library.views import add_game
from library.views import get_id_game
from library.views import catalog_search
from auth_api.views import add_user, password_change, logout
from auth_api.views import verify_user
from auth_api.views import me
from library.views import catalog_resolve
urlpatterns = [
    path("admin/", admin.site.urls),
    #path("api/library/", include("core.urls")),
    path("api/health/", health),
    path("api/library/entries/", add_game),
    path("api/library/entries/<int:id>/", get_id_game),
    path("api/auth/register/", add_user),
    path("api/auth/login/", verify_user),
    path("api/auth/logout/", logout),
    path("api/users/me/", me),
    path("api/users/me/password/", password_change),
    path("api/catalog/search/", catalog_search),
    path("api/catalog/resolve/", catalog_resolve)
]

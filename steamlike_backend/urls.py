from django.contrib import admin
from django.urls import path, include
from library.views import health
from library.views import add_game
from library.views import get_id_game

urlpatterns = [
    path("admin/", admin.site.urls),
    #path("api/library/", include("core.urls")),
    path("api/health/", health),
    path("api/library/entries/", add_game),
    path("api/library/entries/<int:id>/", get_id_game)
]

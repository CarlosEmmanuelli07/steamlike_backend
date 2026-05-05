import requests
from django.core.cache import cache
from .utils import error, duplicated_error, error401, error403, error404, error400, error502, okey200, error503
import logging

logger = logging.getLogger(__name__)

class CatalogService:

    # -------------------------
    # SEARCH (catalog_search)
    # -------------------------
    def search_games(self, q):
        cache_key = f"search:{q}"

        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            response = requests.get(
                    "https://www.cheapshark.com/api/1.0/games",
                    params={"title": q}
                )
        except requests.exceptions.Timeout:
            return error503("External API timeout")

        if response.status_code != 200:
            return error502(f"External API error: {response.status_code}")

        data = response.json()

        if not isinstance(data, list):
            return error502("External API returned unexpected data format")

        result = []
        for game in data:
            result.append({
                "external_game_id": game.get("gameID"),
                "title": game.get("external"),
                "cheapest_price": game.get("cheapest"),
                "thumb": game.get("thumb"),
                "steam_link": f"https://store.steampowered.com/app/{game.get('gameID')}"
            })

        cache.set(cache_key, result, timeout=60)
        return result

    # -------------------------
    # RESOLVE (catalog_resolve)
    # -------------------------
    def resolve_games(self, game_ids):
        if not isinstance(game_ids, list):
            game_ids = [game_ids]

        cache_key = f"resolve:{','.join(map(str, game_ids))}"
        cached = cache.get(cache_key)

        if cached:
            return {"data": cached, "error": None}

        results = []

        for game_id in game_ids:
            try:
                response = requests.get(
                    "https://www.cheapshark.com/api/1.0/games",
                    params={"id": game_id},
                    timeout=10
                )
            except requests.exceptions.Timeout:
                return error503(f"External API timeout for game ID {game_id}")

            if response.status_code != 200:
                return error502(f"External API error for game ID {game_id}: {response.status_code}")

            game_data = response.json()
            game = game_data.get("info")

            if not game:
                return error502(f"External API error for game ID {game_id}: Game not found")

            results.append({
                "external_game_id": game_id,
                "title": game.get("title"),
                "thumb": game.get("thumb"),
                "steam_link": f"https://store.steampowered.com/app/{game_id}"
            })

        cache.set(cache_key, results, timeout=60)
        return {"data": results, "error": None}
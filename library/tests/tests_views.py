from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from library.models import LibraryEntry

class LibraryEntryExternalIdLengthTests(TestCase):
    def test_health(self):
        # Precondiciones

        # Llamada (usando self.client y la ruta de la vista que queremos probar)
        response = self.client.get("/api/health/")

        # Comprobaciones
        # Comprobar el código HTTP que devuelve una vista
        self.assertEqual(response.status_code, 200)
        # Comprobar el contenido de la respuesta
        self.assertEqual(response.json(), {"status": "ok"})
        # Verifica que una clave existe dentro del JSON de la respuesta.
        self.assertIn("status", response.json())
        # Comprueba el valor concreto devuelto por la vista.
        self.assertEqual(response.json()["status"], "ok")
        # Asegura que la respuesta no contiene información que no debería aparecer.
        self.assertNotIn("paco", response.json())

class RegisterUserTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = "/api/auth/register/"
        self.User = get_user_model()

    def test_register_user_success(self):
        data = {
            "user": "testuser",
            "password": "testpassword"
        }
        response = self.client.post(self.url, data, content_type="application/json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {"message": "ok", "details": {"User created successfully": "ok"}})
        self.assertTrue(self.User.objects.filter(username="testuser").exists())

    def test_register_user_missing_fields(self):
        data = {
            "user": "testuser"
        }
        response = self.client.post(self.url, data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_register_user_invalid_password(self):
        data = {
            "user": "testuser",
            "password": 12345
        }
        response = self.client.post(self.url, data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_register_user_duplicate_username(self):
        self.User.objects.create_user(username="testuser", password="testpassword")
        data = {
            "user": "testuser",
            "password": "newpassword"
        }
        response = self.client.post(self.url, data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_register_user_invalid_json(self):
        response = self.client.post(self.url, "invalid json", content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

class LoginUserTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = "/api/auth/login/"
        self.User = get_user_model()
        self.User.objects.create_user(username="testuser", password="testpassword")

    def test_login_user_success(self):
        data = {
            "user": "testuser",
            "password": "testpassword"
        }
        response = self.client.post(self.url, data, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "ok", "details": {"Login successful": "ok"}})

    def test_login_user_invalid_credentials(self):
        data = {
            "user": "testuser",
            "password": "wrongpassword"
        }
        response = self.client.post(self.url, data, content_type="application/json")
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.json())

    def test_login_user_invalid_json(self):
        response = self.client.post(self.url, "invalid json", content_type="application/json")
        self.assertEqual(response.status_code, 401)

class MeUserTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = "/api/users/me/"
        self.User = get_user_model()
        self.user = self.User.objects.create_user(username="testuser", password="testpassword")

    def test_me_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.json())
    
    def test_me_authenticated(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "id": self.user.id,
            "username": "testuser"
            })

class libraryEntryListTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = "/api/library/entries/"
        self.User = get_user_model()
        self.user = self.User.objects.create_user(username="testuser", password="testpassword")

    def test_library_entry_list_unauthenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_library_entry_list_authenticated(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_entries_only_user_data(self):
        self.client.login(username="testuser", password="testpassword")
        LibraryEntry.objects.create(external_game_id=1, status="playing", hours_played=10, user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["external_game_id"], "1")
    
class LibraryEntryDetailTests(TestCase):

    # create an example user and an example entry
    def setUp(self):
        self.client = Client()
        self.url = "/api/library/entries/{id}/"
        self.User = get_user_model()
        self.user = self.User.objects.create_user(username="testuser", password="testpassword")
        self.entry = LibraryEntry.objects.create(external_game_id="3", status="playing", hours_played=10, user=self.user)

        # Users
        self.user1 = self.User.objects.create_user(
            username="user1",
            password="12345678"
        )

        self.user2 = self.User.objects.create_user(
            username="user2",
            password="12345678"
        )

        # Entries 
        self.entry_user1 = LibraryEntry.objects.create(
            external_game_id="1",
            status="playing",
            hours_played=10,
            user=self.user1
        )

        self.entry_user2 = LibraryEntry.objects.create(
            external_game_id="2",
            status="completed",
            hours_played=20,
            user=self.user2
        )

        # URLs
        self.url_user1 = f"/api/library/entries/{self.entry_user1.id}/"
        self.url_user2 = f"/api/library/entries/{self.entry_user2.id}/"


    ## Check that only authenticated users can access 
    def test_detail_unauthenticated(self):
        response = self.client.get(self.url.format(id=self.entry.id))
        self.assertEqual(response.status_code, 401)
        self.assertIn("error", response.json())

    ## Check that users can only access their own entries
    def test_detail_own_entry(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url.format(id=self.entry.id))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.entry.id)
        self.assertEqual(data["external_game_id"], self.entry.external_game_id)

    # check that other users cannot access this entry
    def test_detail_other_user_entry(self):
        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url_user2)  
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.json())
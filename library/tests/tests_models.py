from django.test import TestCase

from library.models import LibraryEntry

class DemoTest(TestCase):
    def test_demo(self):
        # Comprueba que dos valores son exactamente iguales.
        self.assertEqual(4, 2+2)
        # Comprueba si una condición se cumple o no.
        self.assertTrue(4 == 4)
        self.assertFalse(5 == 4)
        # Permiten distinguir entre None y otros valores como cadenas vacías o ceros.
        self.assertIsNone(None)
        # Comprueba que una acción provoca un error concreto.
        with self.assertRaises(ZeroDivisionError):
            # Codigo que lanza la excepcion
            4/0

class LibraryEntryExternalIdLengthTests(TestCase):
    def test_external_id_length_counts_regular_string(self):
        # Precondiciones
        entry = LibraryEntry(external_game_id="abc")

        # Llamada
        longitud = entry.external_id_length()

        # Comprobaciones
        self.assertEqual(longitud, 3)

    def test_external_id_length_counts_empty_string_as_zero(self):
        # Precondiciones
        entry = LibraryEntry(external_game_id="")

        # Llamada
        longitud = entry.external_id_length()

        # Comprobaciones
        self.assertEqual(longitud, 0)

    def test_external_id_length_counts_whitespace(self):
        # Precondiciones
        entry = LibraryEntry(external_game_id="   ")

        # Llamada
        longitud = entry.external_id_length()

        # Comprobaciones
        self.assertEqual(longitud, 3)

    def test_external_id_length_counts_max_length_boundary_100(self):
        # Precondiciones
        entry = LibraryEntry(external_game_id="x" * 100)

        # Llamada
        longitud = entry.external_id_length()

        # Comprobaciones
        self.assertEqual(longitud, 100)

    def test_external_id_length_raises_type_error_if_not_string_or_none(self):
        # Caso anómalo: asignación indebida en memoria.
        # Precondiciones
        entry = LibraryEntry(external_game_id=123)

        # Llamada
        # Comprobaciones
        with self.assertRaises(TypeError):
            entry.external_id_length()

class LibraryEntryExternalIdUpper(TestCase):
    def test_external_id_upper(self):
        # Precondition
        entry = LibraryEntry(external_game_id="emmanuelli")

        # Call
        chain = entry.external_id_upper()

        # Check
        self.assertEqual(chain, "EMMANUELLI")

class LibraryEntryHoursPlayedLabel(TestCase):
    def test_hours_played_label_0(self):
        # Precondition
        entry = LibraryEntry(hours_played=0)

        # Call
        lable = entry.hours_played_label()

        # Check
        self.assertEqual(lable, "none")

        
    def test_hours_played_label_0(self):
        # Precondition
        entry = LibraryEntry(hours_played=0)

        # Call
        lable = entry.hours_played_label()

        # Check
        self.assertEqual(lable, "none")

    def testest_hours_played_label_1(self):
        # Precondition
        entry = LibraryEntry(hours_played = 1)

        # Call 
        lable = entry.hours_played_label()

        # Check
        self.assertEqual(lable, "low")

    def test_hours_played_label_2(self):
        # Precondition
        entry = LibraryEntry(hours_played = 20)

        # Call 
        lable = entry.hours_played_label()

        # Check
        self.assertEqual(lable, "high")

    def test_status_value_0(self):
        # Precondition
        entry = LibraryEntry(status = LibraryEntry.STATUS_WISHLIST)

        #Call
        lable = entry.status_value()

        #Check
        self.assertEqual(lable, 0)

    def test_status_value_1(self):
            # Precondition
            entry = LibraryEntry(status = LibraryEntry.STATUS_PLAYING)

            #Call
            lable = entry.status_value()

            #Check
            self.assertEqual(lable, 1)
            

    def test_status_value_0(self):
            # Precondition
            entry = LibraryEntry(status = LibraryEntry.STATUS_COMPLETED)

            #Call
            lable = entry.status_value()

            #Check
            self.assertEqual(lable, 2)

    def test_status_value_0(self):
            # Precondition
            entry = LibraryEntry(status = LibraryEntry.STATUS_DROPPED)

            #Call
            lable = entry.status_value()

            #Check
            self.assertEqual(lable, 3)

    def test_status_value_error(self):
            # Precondition
            entry = LibraryEntry(status = " ")

            #Call
            lable = entry.status_value()

            #Check
            self.assertEqual(lable, -1)
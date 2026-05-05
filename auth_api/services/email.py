import os
import requests


def send_email(to, subject, text):
    headers = {
        "Authorization": f"Bearer {os.getenv('MAILEROO_TOKEN')}",
        "Content-Type": "application/json"
    }

    payload = {
        "from": {"address": os.getenv("MAILEROO_FROM_ADDRESS")},
        "to": [{"address": to}],
        "subject": subject,
        "text": text
    }

    r = requests.post(
        os.getenv("MAILEROO_URL"),
        headers=headers,
        json=payload,
        timeout=5
    )

    if r.status_code >= 400:
        raise Exception(f"Email error: {r.text}")

    return True
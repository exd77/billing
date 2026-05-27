#!/usr/bin/env python3
"""
billing-generating proxy server.
Serves static files + proxies POST /api/check to https://api.chkr.cc/
with rate-limit retry logic and delays between requests.
"""
import http.server
import json
import os
import sys
import time
import urllib.request
import urllib.error
from http import HTTPStatus

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8888
BIND = sys.argv[2] if len(sys.argv) > 2 else "0.0.0.0"
DIR = os.path.dirname(os.path.abspath(__file__))

MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
}

# Rate limit tracking
_last_request_time = 0
_request_lock = None

try:
    import threading
    _request_lock = threading.Lock()
except ImportError:
    pass

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"


def api_check(data_str, max_retries=1):
    """Call chkr.cc API with rate-limit handling."""
    global _last_request_time
    payload = json.dumps({"data": data_str}).encode()

    for attempt in range(max_retries):
        # Enforce minimum 500ms between requests
        if _request_lock:
            with _request_lock:
                now = time.time()
                elapsed = now - _last_request_time
                if elapsed < 0.5:
                    time.sleep(0.5 - elapsed)
                _last_request_time = time.time()
        else:
            time.sleep(0.5)

        try:
            req = urllib.request.Request(
                "https://api.chkr.cc/",
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": UA,
                    "Origin": "https://chkr.cc",
                    "Referer": "https://chkr.cc/",
                    "Accept": "application/json, text/plain, */*",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 5 * (attempt + 1)
                print(f"Rate limited, retry in {wait}s (attempt {attempt+1})")
                time.sleep(wait)
                continue
            body = e.read()
            try:
                return json.loads(body)
            except:
                return {"error": "http_error", "code": e.code}
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(2)
                continue
            return {"error": str(e)}

    return {"error": "rate_limited", "status": "Unknown", "message": "Rate limited. Try again in a few minutes."}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def do_POST(self):
        if self.path == "/api/check":
            self._handle_api_check()
        elif self.path == "/api/check-batch":
            self._handle_batch_check()
        elif self.path == "/api/test-check":
            self._handle_test_check()
        else:
            self.send_error(HTTPStatus.NOT_FOUND, "Not Found")

    def _handle_test_check(self):
        """Mock endpoint for testing UI without hitting real API."""
        import random
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        data = json.loads(body)
        card_str = data.get("data", "")
        # 40% chance live for demo
        code = random.choice([0, 0, 1, 1, 0, 1, 0, 0, 1, 0])
        banks = [
            "The Bancorp Bank National Association", "Chase Bank",
            "Bank of America", "Wells Fargo Bank",
            "Citibank NA", "Capital One NA",
            "US Bank National Association", "PNC Bank"
        ]
        result = {
            "code": code,
            "status": "Live" if code == 1 else "Die",
            "message": "Approved" if code == 1 else "Declined",
            "card": {
                "card": card_str,
                "bank": random.choice(banks),
                "type": "mastercard",
                "category": "credit" if random.random() > 0.3 else "debit",
                "country": {
                    "name": "United States",
                    "emoji": "🇺🇸"
                }
            }
        }
        time.sleep(0.05)  # Minimal delay
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def _handle_api_check(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)
            result = api_check(data.get("data", ""))
        except Exception as e:
            result = {"error": str(e)}

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def _handle_batch_check(self):
        """Handle batch of cards — receives { cards: ["num|mm|yyyy|cvv", ...] }"""
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            data = json.loads(body)
            cards = data.get("cards", [])
            results = []
            for card_data in cards:
                result = api_check(card_data)
                results.append(result)
        except Exception as e:
            results = [{"error": str(e)}]

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"results": results}).encode())

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.OK)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        sys.stderr.write("%s - - [%s] %s\n" % (
            self.address_string(), self.log_date_time_string(), format % args))


if __name__ == "__main__":
    server = http.server.HTTPServer((BIND, PORT), Handler)
    print(f"Serving {DIR} on http://{BIND}:{PORT}")
    print(f"API proxy: POST /api/check + /api/check-batch")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()

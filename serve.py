import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def address_string(self):
        # Avoid slow reverse DNS lookups on localhost
        return self.client_address[0]

    def translate_path(self, path):
        # Strip query string and fragment
        clean_path = path.split('?')[0].split('#')[0]

        # 1. /startseite, /home or /index.html -> index.html
        if clean_path in ('/startseite', '/startseite/', '/home', '/home/', '/index.html'):
            return os.path.join(DIRECTORY, 'index.html')

        # 2. Check if clean_path + '.html' exists
        if clean_path != '/' and not os.path.splitext(clean_path)[1]:
            candidate = os.path.join(DIRECTORY, clean_path.lstrip('/').replace('/', os.sep)) + '.html'
            if os.path.isfile(candidate):
                return candidate

        return super().translate_path(path)

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), CleanURLHandler) as httpd:
        print(f"Clean URL Server running at http://localhost:{port}")
        httpd.serve_forever()

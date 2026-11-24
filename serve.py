import http.server
import socketserver
import socket
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Disable caching during development so changes appear immediately
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def address_string(self):
        # Avoid slow reverse DNS lookups on localhost
        return self.client_address[0]

    def translate_path(self, path):
        # Strip query string and fragment
        clean_path = path.split('?')[0].split('#')[0]

        # 1. /startseite, /home or /index.html -> index.html
        if clean_path in ('', '/', '/startseite', '/startseite/', '/home', '/home/', '/index.html'):
            return os.path.join(DIRECTORY, 'index.html')

        # 2. Check if clean_path + '.html' exists
        if not os.path.splitext(clean_path)[1]:
            candidate = os.path.join(DIRECTORY, clean_path.lstrip('/').replace('/', os.sep)) + '.html'
            if os.path.isfile(candidate):
                return candidate

        return super().translate_path(path)

class DualStackThreadingServer(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6
    daemon_threads = True
    allow_reuse_address = True

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        super().server_bind()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    try:
        httpd = DualStackThreadingServer(('::', port), CleanURLHandler)
        print(f"Server running (Dual-Stack IPv4/IPv6) at:")
        print(f"  -> http://localhost:{port}/")
        print(f"  -> http://127.0.0.1:{port}/")
        httpd.serve_forever()
    except Exception as e:
        print(f"Dual-stack failed ({e}), falling back to standard IPv4...")
        class IPv4ThreadingServer(http.server.ThreadingHTTPServer):
            daemon_threads = True
            allow_reuse_address = True
        httpd = IPv4ThreadingServer(('', port), CleanURLHandler)
        print(f"Server running at http://localhost:{port}/")
        httpd.serve_forever()

#!/usr/bin/env python3
"""
Simple HTTP server to serve the Hello World HTML page.
Serves static files and binds to port 5000 for external access.
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler that serves index.html for root requests."""
    
    def do_GET(self):
        """Handle GET requests, serving index.html for root path."""
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()
    
    def end_headers(self):
        """Add security headers to all responses."""
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        super().end_headers()

def main():
    """Start the HTTP server on port 5000."""
    port = 5000
    host = "0.0.0.0"
    
    # Change to the directory containing this script
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Verify index.html exists
    if not Path("index.html").exists():
        print("Error: index.html not found in current directory")
        sys.exit(1)
    
    # Create and configure the server
    with socketserver.TCPServer((host, port), CustomHTTPRequestHandler) as httpd:
        print(f"Server starting on http://{host}:{port}")
        print(f"Serving files from: {os.getcwd()}")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            httpd.shutdown()

if __name__ == "__main__":
    main()

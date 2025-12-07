#!/usr/bin/env python
"""
Smart School Backend Startup Script
Properly handles Python path and starts Flask development server
"""

import sys
import os

# Add the project root to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# Import and run the app
from smart_school_backend.app import app

if __name__ == '__main__':
    print("[*] Starting Smart School Backend...")
    print(f"[*] Project Root: {project_root}")
    print(f"[*] Running on http://127.0.0.1:5000")
    print(f"[*] Press CTRL+C to stop")
    # Use threaded mode, no debug reload (debug=True causes issues on Windows)
    app.run(debug=False, host='127.0.0.1', port=5000, use_reloader=False, threaded=True)


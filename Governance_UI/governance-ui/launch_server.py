import os
import sys
import importlib.util
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
os.chdir(BASE_DIR)
sys.path.insert(0, str(BASE_DIR))
sys.dont_write_bytecode = True

module_path = BASE_DIR / "governance_ui.py"
spec = importlib.util.spec_from_file_location("governance_ui_runtime", module_path)
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)

g.init_db()
g.app.run(host="127.0.0.1", port=5050, debug=False)

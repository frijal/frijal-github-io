import json
from pathlib import Path
from datetime import datetime

# Konfigurasi
HOST = "frijal.github.io"
KEY = "f8399d60e90d46a6945577b73ff3f778"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"

def main():
    Path("mini").mkdir(exist_ok=True)

    # Baca artikel.json di root
    with open("artikel.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    url_list = []
    for entry in data:
        if len(entry) > 1 and entry[1].endswith(".html"):
            url_list.append(f"https://{HOST}/artikel/{entry[1]}")

    indexnow_payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": url_list
    }

    # Simpan JSON IndexNow
    out_json = Path("mini/artikel-indexnow.json")
    with out_json.open("w", encoding="utf-8") as f:
        json.dump(indexnow_payload, f, indent=2, ensure_ascii=False)

    # Buat log .txt unik
    timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    out_log = Path(f"mini/indexnow-log-{timestamp}.txt")
    with out_log.open("w", encoding="utf-8") as f:
        f.write(f"Timestamp (UTC): {timestamp}\n")
        f.write(f"Total URL submitted: {len(url_list)}\n")

    print(f"Generated {out_json} with {len(url_list)} URLs")
    print(f"Log saved to {out_log}")

if __name__ == "__main__":
    main()

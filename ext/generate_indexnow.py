import json
from pathlib import Path

# Konfigurasi
HOST = "frijal.github.io"
KEY = "f8399d60e90d46a6945577b73ff3f778"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"

def main():
    # Pastikan folder mini/ ada
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

    # Simpan ke mini/artikel-indexnow.json
    out_file = Path("mini/artikel-indexnow.json")
    with out_file.open("w", encoding="utf-8") as f:
        json.dump(indexnow_payload, f, indent=2, ensure_ascii=False)

    print(f"Generated {out_file} with {len(url_list)} URLs")

if __name__ == "__main__":
    main()

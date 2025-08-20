import os
import json

def get_title(md_path):
    with open(md_path, encoding="utf-8") as f:
        for line in f:
            if line.strip().startswith("# "):
                return line.strip()[2:]
    return os.path.splitext(os.path.basename(md_path))[0]

toc = []

for root, dirs, files in os.walk("content"):
    for file in files:
        if file.endswith(".md"):
            rel_path = os.path.relpath(os.path.join(root, file), "content")
            parts = file[:-3].split("_")  # Remove .md, split by _
            if len(parts) > 3:
                parts = parts[:3]
            toc.append({
                "path": rel_path.replace("\\", "/"),
                "parts": parts,
                "title": get_title(os.path.join(root, file))
            })

with open("toc.json", "w", encoding="utf-8") as f:
    json.dump(toc, f, ensure_ascii=False, indent=2)
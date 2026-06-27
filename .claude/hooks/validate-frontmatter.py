#!/usr/bin/env python3
"""PostToolUse hook: warns if required frontmatter fields are missing after editing an MDX post."""
import json
import sys
import re
import os
import pathlib

CONTENT_ROOT = pathlib.Path(__file__).resolve().parents[2] / "source" / "content"

data = json.load(sys.stdin)
fp = data.get("tool_input", {}).get("file_path", "")

if not (fp.endswith(".mdx") and ("content/blog/" in fp or "content/tutoriales/" in fp)):
    sys.exit(0)

try:
    resolved = pathlib.Path(fp).resolve()
    resolved.relative_to(CONTENT_ROOT)
except (ValueError, OSError):
    sys.exit(0)

try:
    with open(resolved, encoding="utf-8") as f:
        content = f.read()
except Exception:
    sys.exit(0)

match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
if not match:
    print(f"⚠️  {os.path.basename(fp)}: sin frontmatter", file=sys.stderr)
    sys.exit(0)

fm = match.group(1)

required = ["title", "description", "pubDate", "category", "tags",
            "generatedBy", "generatedAt", "promptBase", "humanReviewed"]
missing = [f for f in required if f"{f}:" not in fm and f"{f} :" not in fm]

if missing:
    print(f"⚠️  Frontmatter incompleto — faltan: {', '.join(missing)}", file=sys.stderr)

# Check imageCredit in body
body = content[match.end():]
if "heroImage" in fm and not body.strip().startswith("*"):
    print("⚠️  Sin crédito de imagen (primera línea del body debe ser *cursiva*)", file=sys.stderr)

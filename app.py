import json, os, uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, abort

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # allow certificate payloads with embedded images
UPLOAD_DIR = os.path.join(app.static_folder, "uploads")
ALLOWED = {"png", "jpg", "jpeg", "webp", "gif"}
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/upload")
def upload():
    f = request.files.get("file")
    ext = f.filename.rsplit(".", 1)[-1].lower() if f and "." in f.filename else ""
    if ext not in ALLOWED:
        return jsonify(error="Please upload a PNG, JPG, WEBP or GIF image."), 400
    name = f"{uuid.uuid4().hex}.{ext}"
    f.save(os.path.join(UPLOAD_DIR, name))
    return jsonify(url=f"/static/uploads/{name}")


@app.post("/print")
def print_view():
    try:
        d = json.loads(request.form["data"])
    except (KeyError, ValueError):
        abort(400)
    if d.get("vibe") not in {"classic", "modern", "royal", "academic"}:
        d["vibe"] = "classic"
    if d.get("lalign") not in {"flex-start", "center", "flex-end"}:
        d["lalign"] = "center"
    d["lsize"] = max(40, min(160, int(d.get("lsize") or 90)))
    # Images are embedded as browser-generated data URLs. This avoids relying on
    # persistent local disk, which is not available to Vercel serverless functions.
    def safe_image(value):
        if not isinstance(value, str):
            return ""
        if value.startswith("data:image/") and ";base64," in value[:80]:
            return value
        # Keep compatibility with images uploaded by the older local version.
        if value.startswith("/static/uploads/"):
            return value
        return ""

    d["logo"] = safe_image(d.get("logo", ""))
    d["sigs"] = [s for s in d.get("sigs", []) if isinstance(s, dict)][:6]
    for sig in d["sigs"]:
        sig["img"] = safe_image(sig.get("img", ""))
    date = ""
    if d.get("date"):
        dt = datetime.strptime(d["date"], "%Y-%m-%d")
        date = f"{dt.day} {dt.strftime('%B %Y')}"
    meta = " — ".join(x for x in (date, d.get("place", "")) if x)
    names = d.get("names") or ["Recipient Name"]
    return render_template("print.html", d=d, names=names, meta=meta)


if __name__ == "__main__":
    app.run(debug=True)

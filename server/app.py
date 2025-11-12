from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from groq import Groq
from dotenv import load_dotenv
import os
import webbrowser

# -------------------------------------------------------
# ✅ APP SETUP
# -------------------------------------------------------
app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app, resources={r"/*": {"origins": "*"}})

basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "pets.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# -------------------------------------------------------
# ✅ LOAD ENVIRONMENT VARIABLES
# -------------------------------------------------------
load_dotenv()
GROQ_KEY = os.getenv("GROQ_API_KEY")
print("🔑 Loaded GROQ_API_KEY:", bool(GROQ_KEY))

if not GROQ_KEY:
    print("⚠️ Warning: GROQ_API_KEY not found in .env file!")

client = Groq(api_key=GROQ_KEY)

# -------------------------------------------------------
# ✅ DATABASE MODELS
# -------------------------------------------------------
class Pet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    type = db.Column(db.String(30))
    age = db.Column(db.Integer)
    description = db.Column(db.String(200))
    adopted = db.Column(db.Boolean, default=False)
    image = db.Column(db.String(200))

class Adoption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(50))
    pet_id = db.Column(db.Integer)
    pet_name = db.Column(db.String(50))

class LostFoundReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(50))
    report_type = db.Column(db.String(10))
    pet_name = db.Column(db.String(50))
    pet_type = db.Column(db.String(30))
    breed = db.Column(db.String(50))
    color = db.Column(db.String(50))
    location = db.Column(db.String(200))
    date = db.Column(db.String(20))
    contact_phone = db.Column(db.String(20))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.now())

# -------------------------------------------------------
# ✅ INITIAL SAMPLE DATA
# -------------------------------------------------------
def init_sample_data():
    pets = [
        Pet(name="Bruno", type="Dog", age=3, description="Friendly golden retriever", image="bruno.webp"),
        Pet(name="Chintu", type="Cat", age=2, description="Playful tabby cat", image="chintu.webp"),
        Pet(name="Coco", type="Bird", age=1, description="Talkative parrot", image="coco.webp"),
        Pet(name="Rocky", type="Rabbit", age=1, description="Loves carrots", image="rocky.webp"),
        Pet(name="Tommy", type="Dog", age=4, description="Energetic labrador", image="tommy.webp"),
        Pet(name="Milo", type="Cat", age=3, description="Siamese cat, independent", image="milo.webp"),
        Pet(name="Soni", type="Rabbit", age=2, description="Cuddly dwarf rabbit", image="soni.webp"),
    ]
    db.session.add_all(pets)
    db.session.commit()

with app.app_context():
    db.create_all()
    if Pet.query.count() == 0:
        init_sample_data()
        print("✅ Sample pets inserted")

# -------------------------------------------------------
# ✅ FRONTEND ROUTES (Serve HTML pages)
# -------------------------------------------------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/pets")
def pets_page():
    return render_template("pets.html")

@app.route("/volunteer")
def volunteer_page():
    return render_template("volunteer.html")

@app.route("/donate")
def donate_page():
    return render_template("donate.html")

@app.route("/community")
def community_page():
    return render_template("community.html")

@app.route("/lost-found")
def lost_found_page():
    return render_template("lost-found.html")

@app.route("/myadoptions")
def myadoptions_page():
    return render_template("myadoptions.html")

@app.route("/<page>")
def render_page(page):
    filepath = os.path.join(app.template_folder, f"{page}.html")
    if os.path.exists(filepath):
        return render_template(f"{page}.html")
    return render_template("index.html")

# -------------------------------------------------------
# ✅ API: PET LIST
# -------------------------------------------------------
@app.route("/api/pets", methods=["GET"])
def api_get_pets():
    pets = Pet.query.filter_by(adopted=False).all()
    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "type": p.type,
            "age": f"{p.age} years",
            "description": p.description,
            "image": f"/static/images/{p.image}"
        } for p in pets
    ])

# -------------------------------------------------------
# ✅ API: ADOPT A PET
# -------------------------------------------------------
@app.route("/api/adopt", methods=["POST"])
def api_adopt():
    data = request.get_json()
    user = data.get("user_name")
    pet_id = data.get("pet_id")

    pet = Pet.query.get(pet_id)
    if not pet:
        return jsonify({"message": "Pet not found"}), 404
    if pet.adopted:
        return jsonify({"message": "Already adopted"})

    pet.adopted = True
    db.session.add(Adoption(user_name=user, pet_id=pet_id, pet_name=pet.name))
    db.session.commit()
    return jsonify({"message": f"You adopted {pet.name} ❤️"}), 200

# -------------------------------------------------------
# ✅ API: USER ADOPTIONS
# -------------------------------------------------------
@app.route("/api/adoptions", methods=["GET"])
def api_user_adoptions():
    user = request.args.get("user_name", "")
    adoptions = Adoption.query.filter_by(user_name=user).all()
    result = []
    for a in adoptions:
        pet = Pet.query.get(a.pet_id)
        if pet:
            result.append({
                "pet_name": pet.name,
                "type": pet.type,
                "age": f"{pet.age} years",
                "description": pet.description,
                "image": f"/static/images/{pet.image}",
                "user_name": user
            })
    return jsonify(result)

# -------------------------------------------------------
# ✅ API: MULTILINGUAL CHATBOT (UPDATED MODEL)
# -------------------------------------------------------
LANG_PROMPTS = {
    "en": "You are PetVerse AI, a friendly pet-care assistant. Reply in English.",
    "hi": "आप PetVerse AI हैं। हिंदी में जवाब दें।",
    "mr": "तू PetVerse AI आहेस. मराठीत उत्तर दे.",
    "kn": "ನೀವು PetVerse AI. ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ."
}

@app.route("/api/chat", methods=["POST"])
def api_chat():
    try:
        data = request.get_json()
        msg = data.get("message", "").strip()
        lang = data.get("lang", "en")

        if not msg:
            return jsonify({"reply": "Please type a message 🐾"})

        # ✅ Updated model name (old one was deprecated)
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": LANG_PROMPTS.get(lang, LANG_PROMPTS["en"])},
                {"role": "user", "content": msg}
            ]
        )

        reply = completion.choices[0].message.content.strip() if completion and completion.choices else "Sorry, I couldn’t get a response 🐾"
        return jsonify({"reply": reply})

    except Exception as e:
        print("Chat error:", e)
        return jsonify({"reply": "❌ Server error. Please try again."}), 500

# -------------------------------------------------------
# ✅ API: RESET DATABASE
# -------------------------------------------------------
@app.route("/api/reset", methods=["POST"])
def api_reset():
    try:
        pets = Pet.query.all()
        for p in pets:
            p.adopted = False
        Adoption.query.delete()
        db.session.commit()
        return jsonify({"message": "✅ All adoptions have been reset! All pets are available again."})
    except Exception as e:
        print("Reset error:", e)
        return jsonify({"error": "❌ Failed to reset database"}), 500

# -------------------------------------------------------
# ✅ START SERVER
# -------------------------------------------------------
if __name__ == "__main__":
    print("🌐 Starting PetVerse locally at http://127.0.0.1:5000 ...")
    webbrowser.open("http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)

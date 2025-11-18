import os
import json
import re
import time
from dotenv import load_dotenv
from openai import OpenAI

# ================================
# 1) ENV
# ================================
load_dotenv()

MODEL = "Qwen/Qwen2.5-7B-Instruct"

def get_openai_client():
    """Crée et retourne un client OpenAI au moment où on en a besoin."""
    api_key = os.getenv("HF_TOKEN")
    if not api_key:
        raise Exception("HF_TOKEN environment variable is missing")
    return OpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=api_key
    )


# ================================
# 2) PROMPT STABLE — FORMAT QCM
# ================================
PROMPT_STABLE = """
Tu es un générateur de quiz.
Tu dois produire EXCLUSIVEMENT du JSON strict.

OBJECTIF :
Créer 10 questions QCM COMPLETES avec leurs choix A, B, C et D écrits dans la question.

FORMAT STRICT :
[
  {
    "type": "QCM",
    "question": "Question ? A: choix1, B: choix2, C: choix3, D: choix4",
    "options": ["A","B","C","D"],
    "answer": "A"
  }
]

RÈGLES :
- EXACTEMENT 10 objets
- UNIQUEMENT type "QCM"
- AUCUN texte hors JSON
- choices A,B,C,D doivent apparaître DANS la question
- options DOIVENT être EXACTEMENT ["A","B","C","D"]
- answer DOIT être UNE lettre
- Le thème doit être respecté

Réponds uniquement avec du JSON pur.
"""


# ================================
# 3) FONCTION : Lecture RL + feedback
# ================================
def build_rl_feedback():
    if not os.path.exists("rl_memory.jsonl"):
        return ""

    penalties = []
    good_examples = []

    with open("rl_memory.jsonl", "r", encoding="utf-8") as f:
        for line in f:
            try:
                event = json.loads(line)
                reward = event.get("reward", 0)
                errors = event.get("errors", [])
                gen = event.get("generated", "")

                if reward <= -1:
                    penalties.extend(errors)
                if reward >= 1:
                    good_examples.append(gen)
            except:
                pass

    text = ""
    if penalties:
        text += "Erreurs à éviter absolument :\n"
        for p in set(penalties):
            text += f"- {p}\n"

    if good_examples:
        text += "\nExemples corrects (à imiter) :\n"
        for ex in good_examples[-2:]:
            text += ex + "\n\n"

    return text.strip()


# ================================
# 4) EXTRACTION JSON
# ================================
def extract_json(text):
    cleaned = text.replace("```json", "").replace("```", "").strip()
    matches = re.findall(r"\[[\s\S]*\]", cleaned)
    return matches[-1] if matches else None


# ================================
# 5) VALIDATION
# ================================
def validate(json_block):
    errors = []
    try:
        data = json.loads(json_block)
        if not isinstance(data, list):
            errors.append("not_list")
        if len(data) != 10:
            errors.append("wrong_length")

        for q in data:
            if q.get("type") != "QCM":
                errors.append("wrong_type")
            if q.get("options") != ["A","B","C","D"]:
                errors.append("wrong_options")
            if q.get("answer") not in ["A","B","C","D"]:
                errors.append("wrong_answer")
            txt = q.get("question", "")
            if "A:" not in txt or "B:" not in txt or "C:" not in txt or "D:" not in txt:
                errors.append("missing_choices_in_question")
    except:
        errors.append("invalid_json")
    return errors


# ================================
# 6) SAUVEGARDE RL
# ================================
def save_rl_event(theme, reward, raw, errors):
    event = {
        "timestamp": time.time(),
        "theme": theme,
        "reward": reward,
        "errors": errors,
        "generated": raw
    }
    with open("rl_memory.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")


# ================================
# 7) GÉNÉRATION
# ================================
def generate_quiz(theme):

    # 🔥 AJOUT : Feedback RL dans le prompt
    rl_feedback = build_rl_feedback()

    prompt = (
        "FEEDBACK D'ENTRAÎNEMENT BASÉ SUR TES ERREURS ET RÉCOMPENSES :\n"
        + rl_feedback
        + "\n\nRESPECTE STRICTEMENT LES RÈGLES SUIVANTES :\n"
        + PROMPT_STABLE
        + f"\nTHÈME : {theme}\n"
    )

    client = get_openai_client()  # ⚡ client créé ici, pas au niveau du module

    for i in range(5):
        print(f"⏳ Tentative {i+1}/5...")

        resp = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.3,
        )

        raw = resp.choices[0].message.content
        json_block = extract_json(raw)

        if json_block:
            try:
                json.loads(json_block)
                return json_block, raw
            except:
                pass

    return json_block, raw

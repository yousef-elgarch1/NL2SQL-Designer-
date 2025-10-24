# Quick Start Guide

## 🚀 Running the Application

### 1. Start Backend (Terminal 1)
```bash
cd c:\Users\lenovo\OneDrive\Bureau\GL_Projects\3A_GL\NL2SQL_Designer\backend
.\venv\Scripts\Activate.ps1
python main.py
```
**Should see:** `INFO:     Uvicorn running on http://127.0.0.1:8000`

### 2. Start Frontend (Terminal 2)
```bash
cd c:\Users\lenovo\OneDrive\Bureau\GL_Projects\3A_GL\NL2SQL_Designer\frontend
npm run dev
```
**Should see:** `Local: http://localhost:3001/`

### 3. Open Browser
Navigate to: **http://localhost:3001**

---

## 📸 Taking Screenshots for README

See: `docs/SCREENSHOT_GUIDE.md`

**Quick list:**
1. step1-input.png
2. step2-validation.png
3. step3-entities.png
4. step4-editor.png
5. step5-sql.png
6. database-connection.png
7. uml-diagrams.png
8. optimization.png
9. sample-data.png

**Save in:** `docs/screenshots/`

---

## 🎤 Presenting to Teacher

See: `docs/PRESENTATION_NOTES.md`

**Key points:**
- We implemented all MDE principles (metamodel, T2M, M2T, DSL)
- Innovation: AI-powered model extraction + end-to-end automation
- Multi-platform generation (5 SQL + 2 UML from 1 model)
- Live demo showing all steps

---

## 📤 Pushing to GitHub

```bash
cd c:\Users\lenovo\OneDrive\Bureau\GL_Projects\3A_GL\NL2SQL_Designer

# Add files
git add .

# Commit
git commit -m "Add README with MDE documentation and screenshots"

# Push
git push -u origin main
```

---

## 🧪 Test Cases

### Simple Test:
```
Create a blog with posts, authors, and comments.
Posts have title and content. Authors have name and email.
Comments belong to posts and have author name and text.
```

### Complex Test:
```
Create an e-commerce system with products, categories, customers,
orders, and order items. Products belong to categories and have
price and stock. Customers place orders containing multiple products
with quantities.
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `README.md` | Main documentation (show to teacher) |
| `docs/PRESENTATION_NOTES.md` | How to present |
| `docs/SCREENSHOT_GUIDE.md` | How to take screenshots |
| `docs/NEXT_STEPS.md` | What to do next |
| `backend/models/metamodel.py` | Core metamodel (show for MDE) |
| `backend/services/entity_extractor.py` | T2M transformation |
| `backend/services/sql_generator.py` | M2T transformation |

---

## Team

- **Youssef ELGARCH** - Team Lead & Backend
- **ELGHEFYRY Salma** - Frontend
- **NIJADI Jihane** - Database
- **Doha NEGRAOUI** - MDE & Metamodel
- **Nisrine IBNOU-KADY** - AI Integration

---

## 🆘 Emergency Contacts

**If something breaks:**
1. Check backend terminal for errors
2. Check frontend terminal for errors
3. Restart both servers
4. Check `.env` file exists with Groq API key

**GitHub Repository:**
https://github.com/yousef-elgarch1/NL2SQL-Designer-.git

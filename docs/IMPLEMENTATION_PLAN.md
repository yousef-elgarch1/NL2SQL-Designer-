# NL2SQL Generator - Phased Implementation Plan

## 📊 Overview

This document outlines the step-by-step implementation plan for the NL2SQL Generator project, divided into 4 testable phases.

---

## 🎯 Phase 1: Core MVP (Weeks 1-4)

**Goal:** Get a working prototype where users can generate diagrams and SQL from natural language prompts.

### Features to Implement:

1. **Backend:**
   - ✅ LLM Service (`llm_service.py`)
     - Implement `generate()` method to call Ollama API
     - Implement `generate_json()` for structured output
     - Implement `check_health()` to verify Ollama connection

   - ✅ Prompt Validator (`prompt_validator.py`)
     - Implement `validate_prompt()` using LLM
     - Load prompt template from `prompts/validation_prompt.txt`
     - Parse LLM JSON response

   - ✅ Entity Extractor (`entity_extractor.py`)
     - Implement `extract_entities()` using LLM
     - Load prompt template from `prompts/extraction_prompt.txt`
     - Build Entity objects from LLM response

   - ✅ Mermaid Service (`mermaid_service.py`)
     - Implement `generate_code()` to create Mermaid syntax
     - Format entities as Mermaid class diagrams
     - Format relationships with proper cardinality

   - ✅ SQL Generator (`sql_generator.py`)
     - Implement `generate_sql()` for PostgreSQL only
     - Use Jinja2 template `postgresql.sql.j2`
     - Generate CREATE TABLE statements
     - Generate foreign keys and indexes

   - ✅ SQL Validator (`sql_validator.py`)
     - Implement basic syntax validation using sqlparse
     - Check for common errors

   - ✅ Routers
     - Implement `/api/v1/prompt/validate` endpoint
     - Implement `/api/v1/diagram/generate` endpoint
     - Implement `/api/v1/sql/generate` endpoint

2. **Frontend:**
   - ✅ Main App Layout
     - Create basic page layout with header
     - Add phase progress indicator

   - ✅ Prompt Input Component
     - Wire up to backend `/prompt/validate`
     - Display validation results

   - ✅ Diagram Viewer Component
     - Integrate Mermaid.js
     - Render diagrams from backend response

   - ✅ SQL Viewer Component
     - Use Monaco Editor for syntax highlighting
     - Add copy and download buttons

### Testing Checklist for Phase 1:

```
□ Ollama is running and accessible
□ Backend starts without errors: http://localhost:8000
□ Frontend starts without errors: http://localhost:3000
□ Enter prompt: "I want a recruitment system with students and enterprises"
□ Prompt validation returns suggestions
□ Diagram is generated and displayed
□ SQL is generated and displayed
□ Can copy SQL to clipboard
□ Can download SQL file
```

### Deliverable:
A working system where you can type a prompt → See a Mermaid diagram → See PostgreSQL SQL → Download .sql file

---

## 🎨 Phase 2: Interactive Editing (Weeks 5-8)

**Goal:** Enable users to edit diagrams visually, through code, and with AI commands.

### Features to Implement:

1. **Backend:**
   - ✅ PlantUML Service (`plantuml_service.py`)
     - Implement PlantUML code generation
     - Integrate with public PlantUML server for rendering

   - ✅ Sync Engine (`sync_engine.py`)
     - Implement visual → metamodel sync
     - Implement code → metamodel sync
     - Implement AI → metamodel sync
     - Add debouncing logic

   - ✅ Diagram Modification
     - Implement `/api/v1/diagram/modify` endpoint
     - Parse AI modification commands
     - Update metamodel incrementally

2. **Frontend:**
   - ✅ Visual Editor (React Flow)
     - Create draggable entity nodes
     - Create relationship edges
     - Emit events on changes

   - ✅ Code Editor (Monaco)
     - Make PlantUML/Mermaid code editable
     - Parse code changes back to metamodel

   - ✅ AI Modification Input
     - Add text input for AI commands
     - Examples: "Add a Teacher entity", "Remove email field from Student"

   - ✅ Synchronization
     - Wire up all three editors
     - Update all views when any changes

### Testing Checklist for Phase 2:

```
□ Can drag entities in visual editor
□ Diagram code updates when entity moved
□ Can edit PlantUML code directly
□ Visual diagram updates when code changed
□ Can type AI command: "Add a Teacher entity"
□ New entity appears in all views
□ All three editors stay synchronized
```

### Deliverable:
Three-way synchronized editing system (Visual ↔ Code ↔ AI)

---

## 🗄️ Phase 3: Multi-Database & Execution (Weeks 9-12)

**Goal:** Support multiple databases and direct database creation.

### Features to Implement:

1. **Backend:**
   - ✅ SQL Templates
     - Create MySQL template (`mysql.sql.j2`)
     - Create Oracle template (`oracle.sql.j2`)
     - Create SQL Server template (`sqlserver.sql.j2`)

   - ✅ SQL Generator Updates
     - Implement DBMS-specific type mapping
     - Support all 4 databases

   - ✅ Database Executor (`db_executor.py`)
     - Implement connection testing
     - Implement SQL execution with SQLAlchemy
     - Handle errors and rollback
     - Verify table creation

   - ✅ Routers
     - Implement `/api/v1/database/test-connection`
     - Implement `/api/v1/database/create`

2. **Frontend:**
   - ✅ DBMS Selector
     - Dropdown to choose PostgreSQL/MySQL/Oracle/SQL Server
     - Update SQL when DBMS changes

   - ✅ Connection Form Component
     - Input fields for host, port, username, password, database
     - Test connection button
     - Execute SQL button

   - ✅ Execution Feedback
     - Show success/error messages
     - Display created tables
     - Show execution time

### Testing Checklist for Phase 3:

```
□ Can select different DBMS from dropdown
□ SQL syntax changes based on DBMS
□ Can enter PostgreSQL connection details
□ Test connection succeeds
□ Execute SQL creates database
□ Success message shows created tables
□ Can verify tables exist in database client
```

### Deliverable:
Complete multi-database support with direct database creation

---

## 📦 Phase 4: Export & Polish (Weeks 13-16)

**Goal:** Add export features and polish the UI/UX.

### Features to Implement:

1. **Backend:**
   - ✅ Export Service (`export_service.py`)
     - Implement PDF export (ReportLab)
     - Implement PNG export (Pillow)
     - Implement JSON export
     - Implement PlantUML/Mermaid source export

   - ✅ Router
     - Implement `/api/v1/export/export`
     - Implement `/api/v1/export/download/{filename}`

2. **Frontend:**
   - ✅ Export Manager Component
     - Dropdown to select export format
     - Preview before export
     - Download button

   - ✅ UI Polish
     - Add loading states
     - Add error handling with toasts
     - Add tooltips and help text
     - Make responsive for mobile

   - ✅ Documentation
     - Create user guide
     - Add in-app tutorial
     - Create demo video

3. **Testing & Documentation:**
   - ✅ Write unit tests (80%+ coverage)
   - ✅ Write integration tests
   - ✅ Create API documentation
   - ✅ Create deployment guide

### Testing Checklist for Phase 4:

```
□ Can export diagram as PDF
□ Can export diagram as PNG
□ Can export metamodel as JSON
□ Can export PlantUML source
□ Can export Mermaid source
□ Downloaded files are valid
□ UI is responsive on mobile
□ All error messages are clear
□ Loading states work correctly
```

### Deliverable:
Production-ready application with all features

---

## 🎓 Learning Resources

### Ollama & LLMs:
- Ollama Documentation: https://ollama.com/docs
- Llama 3.1 Model Card: https://ollama.com/library/llama3.1

### React & TypeScript:
- React Query: https://tanstack.com/query/latest
- MUI Components: https://mui.com/material-ui/getting-started/

### Backend:
- FastAPI: https://fastapi.tiangolo.com/
- Pydantic: https://docs.pydantic.dev/

### Diagrams:
- Mermaid.js: https://mermaid.js.org/
- PlantUML: https://plantuml.com/class-diagram
- React Flow: https://reactflow.dev/

---

## 📝 Notes

- After completing each phase, TEST THOROUGHLY before moving to the next phase
- If you get stuck, ask for help - I can implement specific parts for you
- You can adjust the timeline based on your progress
- Focus on getting Phase 1 working first - it's the foundation

---

## ✅ Current Status

- ✅ Project structure created
- ✅ All files scaffolded
- ⏳ Ready for Phase 1 implementation

**Next Step:** Start implementing Phase 1 backend (LLM Service)

# Screenshot Guide for README

## How to Take Screenshots

### Tools
- **Windows**: Use `Windows + Shift + S` for Snipping Tool
- **Alternative**: Use browser DevTools (F12) screenshot feature for full page captures

### Screenshots Needed (9 total)

#### 1. `step1-input.png`
- **What to show**: Step 1 - Natural Language Input screen
- **Actions**:
  - Enter this prompt: "Create a library management system with books, authors, borrowers, and loans. Books have title, ISBN, publication year. Authors have name and email. Borrowers have name, email, membership date. Loans track which borrower borrowed which book with dates."
  - Take screenshot BEFORE clicking "Validate Prompt"
- **Size**: Full width of the application

---

#### 2. `step2-validation.png`
- **What to show**: Validation results
- **Actions**:
  - Click "Validate Prompt"
  - Wait for success message
  - Take screenshot showing the green checkmark and validation message
- **Size**: Capture the validation panel

---

#### 3. `step3-entities.png`
- **What to show**: Extracted entities
- **Actions**:
  - Click "Extract Entities"
  - Wait for entities to appear
  - Take screenshot showing the list of entities (Book, Author, Borrower, Loan)
- **Size**: Full screen showing all entities

---

#### 4. `step4-editor.png`
- **What to show**: Metamodel editor with entities and attributes
- **Actions**:
  - Click "Next" to go to Step 4
  - Show the editor with multiple entity cards visible
  - Expand at least one entity to show attributes
  - Make sure relationships are visible
- **Size**: Full screen showing multiple entity cards

---

#### 5. `step5-sql.png`
- **What to show**: Generated SQL code
- **Actions**:
  - Select "MySQL" from SQL Dialect dropdown
  - Click "Generate SQL"
  - Take screenshot showing the SQL code with syntax highlighting
  - Make sure CREATE TABLE statements are visible
- **Size**: Capture the SQL viewer panel

---

#### 6. `database-connection.png`
- **What to show**: Database connection form
- **Actions**:
  - Click "Execute on Database" button
  - Fill in the connection details:
    - Database Type: MySQL
    - Host: localhost
    - Port: 3306
    - Username: root
    - Database: library_db
  - Take screenshot showing the 3-step wizard (Configure → Test → Execute)
- **Size**: Full dialog window

---

#### 7. `uml-diagrams.png`
- **What to show**: UML diagram visualization
- **Actions**:
  - Go back to Step 5
  - Click "View Diagrams" or the diagram tab
  - Show either PlantUML or Mermaid diagram
  - Make sure entity relationships are clearly visible
- **Size**: Capture the diagram viewer

---

#### 8. `optimization.png`
- **What to show**: Schema optimization suggestions
- **Actions**:
  - Click "Analyze Schema Quality" button in Step 4
  - Wait for optimization suggestions to load
  - Show the suggestions with different priorities (High/Medium/Low)
  - Capture the overall score (0-100)
- **Size**: Full dialog showing multiple suggestions

---

#### 9. `sample-data.png`
- **What to show**: Sample data generator
- **Actions**:
  - Click "Generate Sample Data" button
  - Set "Rows per table" to 5
  - Select format: "SQL"
  - Click "Generate"
  - Show the generated INSERT statements
- **Size**: Capture the data generation dialog with results

---

## Tips for Good Screenshots

1. **Clean Browser**: Close unnecessary tabs, hide bookmarks bar
2. **Zoom Level**: Keep browser at 100% zoom for consistent sizing
3. **Dark/Light Mode**: Use the same theme for all screenshots
4. **High Resolution**: Take screenshots in at least 1920x1080 resolution
5. **No Personal Info**: Don't include real passwords or sensitive data
6. **Annotations**: Consider adding arrows or highlights to key features (optional)

## File Naming Convention

Save all screenshots with these exact names:
- `step1-input.png`
- `step2-validation.png`
- `step3-entities.png`
- `step4-editor.png`
- `step5-sql.png`
- `database-connection.png`
- `uml-diagrams.png`
- `optimization.png`
- `sample-data.png`

## Where to Save

Place all screenshots in:
```
docs/screenshots/
```

## After Taking Screenshots

1. Verify all 9 images are in the `docs/screenshots/` folder
2. Check that all images are clear and readable
3. Add and commit to git:
   ```bash
   git add docs/screenshots/*.png
   git commit -m "Add application screenshots for README"
   ```

## Alternative: Video Walkthrough

Instead of static screenshots, you could also:
1. Record a 2-3 minute video walkthrough
2. Upload to YouTube/Vimeo
3. Embed in README with:
   ```markdown
   [![Watch Demo](thumbnail.png)](https://youtube.com/watch?v=your_video)
   ```

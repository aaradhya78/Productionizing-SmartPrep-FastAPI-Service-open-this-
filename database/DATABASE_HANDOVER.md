# Database Handover & Developer Guide - SmartPrep AI

This document serves as the developer handover manual and technical guide for managing the database layer of the **SmartPrep AI - Personalized Learning and Exam Intelligence System**.

---

## 1. Database Overview

SmartPrep AI utilizes a relational database management system (**MySQL**) to store student details, study materials, generated notes, quiz records, and study plans.
* **Database Name**: `smartprep`
* **JPA/ORM Layer**: Hibernate (integrated via Spring Data JPA)
* **Design Philosophy**: Relational model with enforced database-level referential integrity (foreign keys, cascading actions, unique indices) to prevent orphan records.

---

## 2. Table Descriptions

The database consists of 5 main tables:

### `users`
Stores student accounts, login credentials, and profile details.
* **id**: (BIGINT, Primary Key, Auto-increment) - Unique identifier for each user.
* **name**: (VARCHAR(255), Nullable) - Student's full name.
* **username**: (VARCHAR(255), Unique, Not Null) - Unique username derived from email.
* **email**: (VARCHAR(255), Unique, Not Null) - Student's unique email.
* **password**: (VARCHAR(255), Not Null) - Hashed password (BCrypt).

### `materials`
Tracks study materials uploaded by students.
* **id**: (BIGINT, Primary Key, Auto-increment) - Unique material ID.
* **user_id**: (BIGINT, Foreign Key, Not Null) - References `users(id)`.
* **filename**: (VARCHAR(255), Not Null) - Name of the uploaded file.
* **file_type**: (VARCHAR(50), Nullable) - Extension of the file (e.g., pdf, docx).
* **extracted_content**: (LONGTEXT, Nullable) - Extracted text content from documents, used for generating quizzes/notes.
* **uploaded_at**: (DATETIME, Not Null, Default: CURRENT_TIMESTAMP) - Upload date and time.

### `notes`
Stores AI-generated study outlines and summaries.
* **id**: (BIGINT, Primary Key, Auto-increment) - Unique note ID.
* **user_id**: (BIGINT, Foreign Key, Not Null) - References the note owner (`users.id`).
* **material_id**: (BIGINT, Foreign Key, Nullable) - References the source file (`materials.id`).
* **topic**: (VARCHAR(255), Not Null) - Note topic.
* **content**: (LONGTEXT, Nullable) - Markdown-formatted study notes.
* **generated_at**: (DATETIME, Not Null, Default: CURRENT_TIMESTAMP) - Generation date.

### `quiz_results`
Logs scores and metrics of completed quizzes.
* **id**: (BIGINT, Primary Key, Auto-increment) - Unique quiz result ID.
* **user_id**: (BIGINT, Foreign Key, Nullable) - References the student (`users.id`).
* **topic**: (VARCHAR(255), Nullable) - Subject or topic of the quiz.
* **total_questions**: (INT, Not Null, Default: 0) - Number of questions in the quiz.
* **score**: (INT, Not Null, Default: 0) - Student's final score.
* **taken_at**: (DATETIME, Not Null, Default: CURRENT_TIMESTAMP) - Completion date.

### `schedules`
Stores AI-generated, personalized study plans.
* **id**: (BIGINT, Primary Key, Auto-increment) - Unique schedule ID.
* **user_id**: (BIGINT, Foreign Key, Not Null) - References the student (`users.id`).
* **exam_date**: (DATE, Not Null) - Exam target completion date.
* **study_hours_per_day**: (INT, Not Null, Default: 0) - Planned hours per day.
* **subjects_json**: (TEXT, Nullable) - List of subjects & priorities formatted as a JSON string.
* **generated_plan_json**: (LONGTEXT, Nullable) - Detailed weekly timeline formatted as a JSON string.
* **created_at**: (DATETIME, Not Null, Default: CURRENT_TIMESTAMP) - Creation date.

---

## 3. Relationships & Keys

### Foreign Key Schemas

```sql
-- materials -> users
CONSTRAINT fk_materials_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- notes -> users & materials
CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
CONSTRAINT fk_notes_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL

-- quiz_results -> users
CONSTRAINT fk_quiz_results_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL

-- schedules -> users
CONSTRAINT fk_schedules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

### Relationship Type Summary
* **User $\rightarrow$ Materials / Notes / Schedules**: One-to-Many. (Implemented as unidirectional `@ManyToOne` references from the child tables). Deleting a user automatically cascades and deletes their materials, notes, and study plans from the database.
* **User $\rightarrow$ QuizResults**: One-to-Many. Deleting a user preserves the quiz analytics for system statistics but sets the `user_id` inside `quiz_results` to `NULL`.
* **Material $\rightarrow$ Notes**: One-to-Many. Deleting an uploaded document preserves the summary notes, setting the `material_id` to `NULL`.

---

## 4. How to Initialize the Database Locally

### Prerequisites
1. Installed **MySQL Server** (v8.0+ recommended).
2. A MySQL CLI terminal or graphic administration program (Workbench, DBeaver, phpMyAdmin).

### Step 1: Connect to Local MySQL
Open your terminal and log in using your admin user:
```bash
mysql -u root -p
```

### Step 2: Run Schema Script
Run the **[schema.sql](file:///d:/Code/Minor/SmartPrep-ai-main/database/schema.sql)** script to create the `smartprep` schema and the tables:
```sql
SOURCE d:/Code/Minor/SmartPrep-ai-main/database/schema.sql;
```
*(Alternatively, copy and paste the contents of `schema.sql` into your graphical SQL editor and run it).*

### Step 3: Run Seeding Script (Optional)
Run the **[seed-data.sql](file:///d:/Code/Minor/SmartPrep-ai-main/database/seed-data.sql)** script to load development data:
```sql
SOURCE d:/Code/Minor/SmartPrep-ai-main/database/seed-data.sql;
```
This inserts sample users (`hiten` and `alice`), mock PDF text content, generated notes, and sample JSON schedules.

### Step 4: Configure Spring Boot Connection
Update the file `backend/src/main/resources/application.properties` with your database credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartprep
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Keeps existing columns and schema in sync with JPA entities
spring.jpa.hibernate.ddl-auto=update
```

---

## 5. Troubleshooting Steps

### Error 1: `Access denied for user 'root'@'localhost'`
* **Cause**: Incorrect MySQL password in `application.properties`.
* **Fix**: Log into MySQL directly using command line to verify password. Update the `spring.datasource.password` field in `application.properties`.

### Error 2: `Table 'smartprep.users' doesn't exist`
* **Cause**: Spring Boot started before running `schema.sql`, and `ddl-auto` is set to `none` or `validate`, or the database `smartprep` was not created.
* **Fix**: Ensure you have executed `schema.sql` first. Confirm `spring.jpa.hibernate.ddl-auto` is set to `update` in `application.properties`.

### Error 3: `Data truncation: Data too long for column 'extracted_content'`
* **Cause**: Document text size exceeded the column limit. (Previously caused by standard `TEXT` configuration).
* **Fix**: Verify your schema is using the updated `LONGTEXT` columns. Verify that `extractedContent` in `Material.java` is mapped with `@Column(columnDefinition = "LONGTEXT")`.

---


## 6. Viva Questions & Answers (Database Design)

### Q1: Why did you choose MySQL over NoSQL (like MongoDB) for this project?
**Answer**: Our project has strongly structured entity relationships. An AI learning platform requires relational connections—for instance, notes and study schedules are directly linked to a specific user, and notes are generated from specific uploaded materials. MySQL provides robust transaction capabilities, enforces relational constraint consistency (Foreign Keys), and allows clean join queries.

### Q2: Why did you use `LONGTEXT` for `extracted_content` and `generated_plan_json` instead of standard `TEXT` or `VARCHAR`?
**Answer**:
* `VARCHAR` is limited to 65,535 bytes (less in practice with UTF-8 encoding) and is meant for short text.
* Standard `TEXT` is limited to 64 KB.
* A parsed PDF document containing pages of study material, or a year-long weekly study schedule structured in JSON, can easily exceed 64 KB. `LONGTEXT` supports up to 4 GB, preventing runtime database truncation errors.

### Q3: What does `ON DELETE CASCADE` do in your schema? Give an example.
**Answer**: It ensures database referential integrity. When a parent record is deleted, any child record referencing that parent is automatically deleted by the database engine.
* **Example**: If a user is deleted from the `users` table, all their records in `materials`, `notes`, and `schedules` are automatically deleted. This prevents "orphan records" from consuming database space.

### Q4: Why does `quiz_results` use `ON DELETE SET NULL` instead of `ON DELETE CASCADE`?
**Answer**: If a user deletes their account, we may want to keep the historical quiz performance statistics (average scores, frequency of quizzes taken) for systemic AI analysis and platform optimization. Using `ON DELETE SET NULL` keeps the quiz record intact but sets `user_id` to `NULL`.

### Q5: What is the purpose of Hibernate's `ddl-auto=update` setting?
**Answer**: It tells Hibernate to automatically compare the JPA entity classes in our Java codebase with the active MySQL database tables on startup. If columns are missing or new entities are added, Hibernate will dynamically alter the database tables to match the Java code without wiping out existing database tables.

### Q6: How do you handle JSON data (`subjects_json`, `generated_plan_json`) inside a relational MySQL database?
**Answer**: We store JSON objects/arrays as structured strings using `TEXT`/`LONGTEXT` types. In Java, these are defined as `String` fields. Before saving, Java converts the objects to JSON strings (using Jackson's `ObjectMapper`), and maps them back to Java collections when querying the database.

### Q7: What is the difference between database-level cascades and JPA-level cascades?
**Answer**:
* **Database Cascades** (e.g. `ON DELETE CASCADE` in SQL): Handled directly by the database engine. It is highly efficient and guarantees that data remains clean regardless of what program deletes a record.
* **JPA Cascades** (e.g. `cascade = CascadeType.REMOVE` in Java): Handled by the Hibernate application layer. Hibernate will load child objects into memory first and issue individual delete statements. We rely on database-level cascades for speed, but align our entity types to avoid Hibernate session caching sync issues.

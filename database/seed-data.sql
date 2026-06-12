USE smartprep;

-- Clear existing data (in order of dependencies)
DELETE FROM schedules;
DELETE FROM quiz_results;
DELETE FROM notes;
DELETE FROM materials;
DELETE FROM users;

-- Reset Auto-Increment Counters
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE materials AUTO_INCREMENT = 1;
ALTER TABLE notes AUTO_INCREMENT = 1;
ALTER TABLE quiz_results AUTO_INCREMENT = 1;
ALTER TABLE schedules AUTO_INCREMENT = 1;

-- 1. Seed Users
-- Passwords are bcrypt hashes for 'password123'
INSERT INTO users (id, name, username, email, password) VALUES
(1, 'Hiten Kumar', 'hiten', 'hiten@example.com', '$2a$10$8.ZpG2.o5b9.ZlP4fT15s.2Bw7p8oG433.X.a/cQZ0h4tD/H.98eS'),
(2, 'Alice Smith', 'alice', 'alice@example.com', '$2a$10$8.ZpG2.o5b9.ZlP4fT15s.2Bw7p8oG433.X.a/cQZ0h4tD/H.98eS');

-- 2. Seed Materials
INSERT INTO materials (id, user_id, filename, file_type, extracted_content, uploaded_at) VALUES
(1, 1, 'Algorithms_MidSem.pdf', 'pdf', 'Dynamic Programming is an algorithmic paradigm that solves a given complex problem by breaking it into subproblems and storing the results of subproblems to avoid computing the same results again. Principal of Optimality: An optimal sequence of decisions has the property that whatever the initial state and decision are, the remaining decisions must constitute an optimal policy with regard to the state resulting from the first decision.', '2026-06-05 10:00:00'),
(2, 1, 'Database_Systems_Notes.docx', 'docx', 'Relational Database Management System (RDBMS) stores data in table structures with rows and columns. Relational Algebra is a procedural query language, which takes instances of relations as input and yields instances of relations as output. Major operations: Selection, Projection, Union, Set Difference, Cartesian Product, and Rename.', '2026-06-05 12:30:00'),
(3, 2, 'Computer_Networks.pdf', 'pdf', 'The OSI Model consists of seven layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. TCP is a connection-oriented, reliable transport protocol, whereas UDP is connectionless and unreliable but fast.', '2026-06-06 09:15:00');


-- 3. Seed Notes
INSERT INTO notes (id, user_id, material_id, topic, content, generated_at) VALUES
(1, 1, 1, 'Dynamic Programming Intro', '### Key Takeaways\n1. **DP vs Divide & Conquer**: DP reuses solutions to subproblems (overlapping subproblems), while Divide & Conquer solves them independently.\n2. **Memoization vs Tabulation**: Memoization is top-down (caching recursive results), tabulation is bottom-up (iterative table building).\n3. **Optimal Substructure**: The optimal solution to the problem contains optimal solutions to its subproblems.', '2026-06-05 10:15:00'),
(2, 1, 2, 'Relational Algebra Operations', '### Fundamental Operations\n* **Selection (σ)**: Filters rows based on a condition.\n* **Projection (π)**: Selects specific columns and eliminates duplicates.\n* **Cartesian Product (x)**: Combines tuples from two relations.\n* **Join (⋈)**: Combines related tuples based on common attributes.', '2026-06-05 13:00:00');

-- 4. Seed Quiz Results
INSERT INTO quiz_results (id, user_id, topic, total_questions, score, taken_at) VALUES
(1, 1, 'Dynamic Programming', 10, 8, '2026-06-05 11:00:00'),
(2, 1, 'Relational Algebra', 5, 4, '2026-06-05 14:00:00'),
(3, 2, 'OSI Model Layers', 10, 9, '2026-06-06 10:30:00');

-- 5. Seed Schedules
INSERT INTO schedules (id, user_id, exam_date, study_hours_per_day, subjects_json, generated_plan_json, created_at) VALUES
(1, 1, '2026-07-01', 3, 
 '[{"name":"Algorithms","priority":"High"},{"name":"Databases","priority":"Medium"}]', 
 '{"weeks":[{"week":1,"topics":["Dynamic Programming","Greedy Algorithms","SQL Basics"]},{"week":2,"topics":["Graph Algorithms","Relational Algebra","Normal Forms"]}]}', 
 '2026-06-05 09:00:00');

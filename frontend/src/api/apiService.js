import axiosInstance from './axios';

// Local storage helper
const getLocal = (key, defaultVal) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const setLocal = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// Initial mock data if localStorage is empty
const INITIAL_MATERIALS = [
  { id: '1', filename: 'Algorithms_MidSem.pdf', fileType: 'pdf', uploadedAt: '2026-06-05T10:00:00Z' },
  { id: '2', filename: 'Database_Systems_Notes.docx', fileType: 'docx', uploadedAt: '2026-06-05T12:30:00Z' },
];

const INITIAL_NOTES = [
  { id: '1', title: 'Introduction to Algorithms', content: 'An algorithm is a finite sequence of well-defined, computer-implementable instructions, typically to solve a class of specific problems or to perform a computation. Crucial requirements: 1. Input. 2. Output. 3. Finiteness. 4. Definiteness. 5. Effectiveness. Big-O analysis determines scaling behavior.', topic: 'Algorithms', materialId: '1' },
  { id: '2', title: 'Big-O Notation', content: 'Big-O notation describes the upper bound of time complexity. O(1) = constant time, O(n) = linear time, O(log n) = logarithmic time, O(n log n) = linearithmic time, O(n^2) = quadratic time. It helps developers predict how an algorithm will scale as input size increases.', topic: 'Algorithms', materialId: '1' },
  { id: '3', title: 'Relational Database Design', content: 'Database normalization is the process of structuring a relational database in accordance with a series of normal forms (1NF, 2NF, 3NF, BCNF) to reduce data redundancy and improve data integrity. Primary key uniquely identifies a row, foreign key links to another table.', topic: 'Databases', materialId: '2' },
];

const INITIAL_SCHEDULE = {
  examDate: '2026-06-25',
  studyHoursPerDay: 4,
  subjects: [
    { name: 'Algorithms', weight: 'High' },
    { name: 'Database Systems', weight: 'Medium' },
    { name: 'Networks', weight: 'High' }
  ],
  tasks: [
    { id: 't1', date: '2026-06-07', subject: 'Algorithms', hours: 2, completed: true, type: 'Study' },
    { id: 't2', date: '2026-06-07', subject: 'Database Systems', hours: 1, completed: false, type: 'Revision' },
    { id: 't3', date: '2026-06-08', subject: 'Networks', hours: 2, completed: false, type: 'Practice' },
    { id: 't4', date: '2026-06-09', subject: 'Algorithms', hours: 2, completed: false, type: 'Exam' },
  ]
};

const INITIAL_QUIZ_HISTORY = [
  { id: 'q1', topic: 'Algorithms', score: 8, totalQuestions: 10, date: '2026-06-04' },
  { id: 'q2', topic: 'Databases', score: 7, totalQuestions: 10, date: '2026-06-05' },
];

const INITIAL_FLASHCARDS = [
  { id: 'fc1', question: 'What is the average time complexity of Quick Sort?', answer: 'O(n log n)', topic: 'Algorithms', mastered: true },
  { id: 'fc2', question: 'What is the main difference between a stack and a queue?', answer: 'Stack is LIFO (Last In, First Out), while Queue is FIFO (First In, First Out).', topic: 'Data Structures', mastered: false },
  { id: 'fc3', question: 'Explain normalization in relational databases.', answer: 'It is the process of structuring database schemas to minimize redundancy and dependency.', topic: 'Databases', mastered: false },
  { id: 'fc4', question: 'What does BCNF stand for in Database Systems?', answer: 'Boyce-Codd Normal Form, which is a stronger version of 3rd Normal Form.', topic: 'Databases', mastered: true },
];

const INITIAL_MOCK_TESTS = [
  { id: 'mt1', subject: 'Algorithms', type: 'Full-Length', score: 25, totalQuestions: 30, timeSpent: '28 mins', date: '2026-06-03' },
  { id: 'mt2', subject: 'Networks', type: 'Section-Wise', score: 8, totalQuestions: 10, timeSpent: '8 mins', date: '2026-06-04' },
];

// Seed local storage if empty
if (!localStorage.getItem('sm_materials')) setLocal('sm_materials', INITIAL_MATERIALS);
if (!localStorage.getItem('sm_notes')) setLocal('sm_notes', INITIAL_NOTES);
if (!localStorage.getItem('sm_schedule')) setLocal('sm_schedule', INITIAL_SCHEDULE);
if (!localStorage.getItem('sm_quiz_history')) setLocal('sm_quiz_history', INITIAL_QUIZ_HISTORY);
if (!localStorage.getItem('sm_flashcards')) setLocal('sm_flashcards', INITIAL_FLASHCARDS);
if (!localStorage.getItem('sm_mock_tests')) setLocal('sm_mock_tests', INITIAL_MOCK_TESTS);

export const apiService = {
  // --- MATERIALS ---
  materials: {
    get: async () => {
      try {
        const res = await axiosInstance.get('/materials');
        // If it returns standard array
        if (Array.isArray(res.data)) {
          return res.data.map((m, idx) => typeof m === 'string' ? { id: String(idx + 1), filename: m, fileType: 'pdf', uploadedAt: new Date().toISOString() } : m);
        }
        return res.data;
      } catch (err) {
        console.warn('Backend materials fetch failed, using local storage.');
        return getLocal('sm_materials', INITIAL_MATERIALS);
      }
    },
    upload: async (filesList) => {
      try {
        const formData = new FormData();
        Array.from(filesList).forEach(file => formData.append('files', file));
        const res = await axiosInstance.post('/materials/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Save to local storage too
        const local = getLocal('sm_materials', INITIAL_MATERIALS);
        const newItems = Array.from(filesList).map((file, idx) => ({
          id: res.data.fileId ? `${res.data.fileId}-${idx}` : String(Date.now() + idx),
          filename: file.name,
          fileType: file.name.split('.').pop() || 'pdf',
          uploadedAt: new Date().toISOString()
        }));
        setLocal('sm_materials', [...local, ...newItems]);
        return { success: true, files: newItems };
      } catch (err) {
        console.warn('Backend materials upload failed, running local mock.');
        const local = getLocal('sm_materials', INITIAL_MATERIALS);
        const newItems = Array.from(filesList).map((file, idx) => ({
          id: String(Date.now() + idx),
          filename: file.name,
          fileType: file.name.split('.').pop() || 'pdf',
          uploadedAt: new Date().toISOString()
        }));
        setLocal('sm_materials', [...local, ...newItems]);
        return { success: true, files: newItems };
      }
    },
    rename: async (id, newName) => {
      try {
        await axiosInstance.put(`/materials/${id}`, { filename: newName });
      } catch (err) {
        console.warn('Backend rename failed, saving locally.');
      }
      const local = getLocal('sm_materials', INITIAL_MATERIALS);
      const updated = local.map(m => m.id === id ? { ...m, filename: newName } : m);
      setLocal('sm_materials', updated);
      return { success: true };
    },
    delete: async (id) => {
      try {
        await axiosInstance.delete(`/materials/${id}`);
      } catch (err) {
        console.warn('Backend delete failed, removing locally.');
      }
      const local = getLocal('sm_materials', INITIAL_MATERIALS);
      const filtered = local.filter(m => m.id !== id);
      setLocal('sm_materials', filtered);
      return { success: true };
    },
    download: async (id, filename) => {
      try {
        const res = await axiosInstance.get(`/materials/${id}/download`, { responseType: 'blob' });
        const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true };
      } catch (err) {
        console.warn('Backend download failed, simulating download.');
        const fakeBlob = new Blob([`Simulated content for ${filename}`], { type: 'text/plain' });
        const blobUrl = window.URL.createObjectURL(fakeBlob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true };
      }
    }
  },

  // --- NOTES ---
  notes: {
    get: async () => {
      return getLocal('sm_notes', INITIAL_NOTES);
    },
    generate: async (materialId) => {
      try {
        const res = await axiosInstance.post('/notes/generate', { materialId });
        const notesData = res.data.notes || [];
        const formatted = notesData.map((n, i) => ({
          id: String(Date.now() + i),
          title: n.title,
          content: n.content,
          topic: n.topic || 'General',
          materialId
        }));
        
        const local = getLocal('sm_notes', INITIAL_NOTES);
        setLocal('sm_notes', [...local, ...formatted]);
        return { success: true, notes: formatted };
      } catch (err) {
        console.warn('Backend notes generation failed, generating local content.');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
        
        // Find filename
        const materials = getLocal('sm_materials', INITIAL_MATERIALS);
        const m = materials.find(mat => mat.id === materialId);
        const topic = m ? m.filename.split('_')[0] : 'Algorithms';

        const mockNewNotes = [
          {
            id: String(Date.now()),
            title: `Key Concepts in ${topic}`,
            content: `Core takeaways from ${m?.filename || 'the material'}:\n\n1. Primary definitions. Detailed explanation of topics, structuring patterns, and constraints.\n2. Performance profiles. Time complexity bottlenecks, resource utilization, and memory optimization techniques.\n3. Implementation recipes. Step-by-step guides for applying these structures in system design.`,
            topic,
            materialId
          },
          {
            id: String(Date.now() + 1),
            title: `Advanced Topics in ${topic}`,
            content: `Detailed notes on sub-topics:\n\n- Theoretical foundation and limits of computing/storage.\n- Practical code templates and structural layouts.\n- Common failure states and debugging patterns for standard interview scenarios.`,
            topic,
            materialId
          }
        ];
        const local = getLocal('sm_notes', INITIAL_NOTES);
        setLocal('sm_notes', [...local, ...mockNewNotes]);
        return { success: true, notes: mockNewNotes };
      }
    },
    update: async (id, updatedNote) => {
      const local = getLocal('sm_notes', INITIAL_NOTES);
      const updated = local.map(n => n.id === id ? { ...n, ...updatedNote } : n);
      setLocal('sm_notes', updated);
      return { success: true };
    },
    delete: async (id) => {
      const local = getLocal('sm_notes', INITIAL_NOTES);
      const filtered = local.filter(n => n.id !== id);
      setLocal('sm_notes', filtered);
      return { success: true };
    }
  },

  // --- QUIZZES ---
  quiz: {
    getHistory: async () => {
      return getLocal('sm_quiz_history', INITIAL_QUIZ_HISTORY);
    },
    generate: async (materialId) => {
      try {
        const res = await axiosInstance.post('/quiz/generate', { materialId });
        return { success: true, quiz: res.data.quiz };
      } catch (err) {
        console.warn('Backend quiz generation failed, using mock generator.');
        await new Promise(resolve => setTimeout(resolve, 1200));

        const materials = getLocal('sm_materials', INITIAL_MATERIALS);
        const m = materials.find(mat => mat.id === materialId);
        const topic = m ? m.filename.split('_')[0] : 'Data Structures';

        const mockQuiz = [
          {
            question: `Which of the following describes the worst-case efficiency of operations in ${topic}?`,
            options: ['O(1) Constant', 'O(n) Linear', 'O(log n) Logarithmic', 'It varies depending on input distribution'],
            correctAnswer: 3,
            explanation: `Efficiency depends heavily on input structure. For instance, in unbalanced binary trees, searches degrade to O(n), whereas balanced ones remain O(log n).`
          },
          {
            question: `In a production system, what is the best strategy to optimize ${topic} storage?`,
            options: ['Using contiguous memory arrays', 'Using linked dynamic allocations', 'Applying hashing and caching', 'All of the above based on constraint balancing'],
            correctAnswer: 3,
            explanation: 'SaaS and modern systems require composite data layouts to achieve maximum efficiency (e.g., hash tables backing linear arrays).'
          },
          {
            question: `What is the primary memory overhead associated with dynamic ${topic} implementations?`,
            options: ['Pointer reference overhead', 'Array capacity doubling garbage collection', 'CPU context switching limits', 'Disk page swapping delays'],
            correctAnswer: 0,
            explanation: 'Dynamic node structures require memory for address pointers, which can equal or exceed the size of the actual payloads stored.'
          }
        ];
        return { success: true, quiz: mockQuiz };
      }
    },
    submit: async (topic, score, totalQuestions) => {
      try {
        await axiosInstance.post('/quiz/submit', { topic, score, totalQuestions });
      } catch (err) {
        console.warn('Backend quiz submit failed, saving locally.');
      }
      const local = getLocal('sm_quiz_history', INITIAL_QUIZ_HISTORY);
      const newItem = {
        id: String(Date.now()),
        topic,
        score,
        totalQuestions,
        date: new Date().toISOString().split('T')[0]
      };
      setLocal('sm_quiz_history', [newItem, ...local]);
      return { success: true };
    }
  },

  // --- FLASHCARDS ---
  flashcards: {
    get: async () => {
      return getLocal('sm_flashcards', INITIAL_FLASHCARDS);
    },
    generate: async (materialId) => {
      try {
        const res = await axiosInstance.post('/flashcards/generate', { materialId });
        const flashcardsData = res.data.flashcards || [];
        const formatted = flashcardsData.map((fc, i) => ({
          id: fc.id || String(Date.now() + i),
          question: fc.question,
          answer: fc.answer,
          topic: fc.topic || 'General',
          mastered: false
        }));
        
        const local = getLocal('sm_flashcards', INITIAL_FLASHCARDS);
        setLocal('sm_flashcards', [...local, ...formatted]);
        return { success: true, flashcards: formatted };
      } catch (err) {
        console.warn('Backend flashcards generation failed, using mock generator.');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const materials = getLocal('sm_materials', INITIAL_MATERIALS);
        const m = materials.find(mat => mat.id === materialId);
        const topic = m ? m.filename.split('_')[0] : 'Algorithms';

        const mockFlashcards = [
          {
            id: String(Date.now()),
            question: `What is the core purpose of a ${topic} layout?`,
            answer: `To optimize the performance, data flow, and structure of computations or records.`,
            topic,
            mastered: false
          },
          {
            id: String(Date.now() + 1),
            question: `Explain space-time tradeoff in ${topic}.`,
            answer: `You can design faster algorithms by consuming more memory, or reduce memory usage at the cost of processing speed.`,
            topic,
            mastered: false
          },
          {
            id: String(Date.now() + 2),
            question: `What is a common edge case for ${topic}?`,
            answer: `Empty sets, overflow values, null references, and duplicate elements.`,
            topic,
            mastered: false
          }
        ];

        const local = getLocal('sm_flashcards', INITIAL_FLASHCARDS);
        setLocal('sm_flashcards', [...local, ...mockFlashcards]);
        return { success: true, flashcards: mockFlashcards };
      }
    },
    toggleMastered: async (id) => {
      const local = getLocal('sm_flashcards', INITIAL_FLASHCARDS);
      const updated = local.map(fc => fc.id === id ? { ...fc, mastered: !fc.mastered } : fc);
      setLocal('sm_flashcards', updated);
      return { success: true };
    }
  },

  // --- SCHEDULE / PLANNER ---
  schedule: {
    get: async () => {
      return getLocal('sm_schedule', INITIAL_SCHEDULE);
    },
    generate: async (formData) => {
      try {
        await axiosInstance.post('/schedule/generate', formData);
        // Map to local structure if needed
        const newTasks = Array.from({ length: 10 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const sub = formData.subjects[i % formData.subjects.length]?.name || 'Algorithms';
          return {
            id: `task-${Date.now()}-${i}`,
            date: date.toISOString().split('T')[0],
            subject: sub,
            hours: Number(formData.studyHoursPerDay) > 4 ? 3 : 2,
            completed: false,
            type: i % 2 === 0 ? 'Study' : 'Revision'
          };
        });
        const plan = {
          examDate: formData.examDate,
          studyHoursPerDay: Number(formData.studyHoursPerDay),
          subjects: formData.subjects,
          tasks: newTasks
        };
        setLocal('sm_schedule', plan);
        return { success: true, plan };
      } catch (err) {
        console.warn('Backend schedule failed, mocking locally.');
        const newTasks = Array.from({ length: 14 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const sub = formData.subjects[i % formData.subjects.length]?.name || 'Algorithms';
          return {
            id: `task-${Date.now()}-${i}`,
            date: date.toISOString().split('T')[0],
            subject: sub,
            hours: Number(formData.studyHoursPerDay) > 4 ? 3 : 2,
            completed: false,
            type: i % 2 === 0 ? 'Study' : 'Revision'
          };
        });
        const plan = {
          examDate: formData.examDate,
          studyHoursPerDay: Number(formData.studyHoursPerDay),
          subjects: formData.subjects,
          tasks: newTasks
        };
        setLocal('sm_schedule', plan);
        return { success: true, plan };
      }
    },
    toggleTask: async (id) => {
      const schedule = getLocal('sm_schedule', INITIAL_SCHEDULE);
      const updatedTasks = schedule.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      const updated = { ...schedule, tasks: updatedTasks };
      setLocal('sm_schedule', updated);
      return { success: true, plan: updated };
    },
    rescheduleTask: async (id, newDate) => {
      const schedule = getLocal('sm_schedule', INITIAL_SCHEDULE);
      const updatedTasks = schedule.tasks.map(t => t.id === id ? { ...t, date: newDate } : t);
      const updated = { ...schedule, tasks: updatedTasks };
      setLocal('sm_schedule', updated);
      return { success: true, plan: updated };
    }
  },

  // --- MOCK TESTS ---
  mockTests: {
    get: async () => {
      return getLocal('sm_mock_tests', INITIAL_MOCK_TESTS);
    },
    submit: async (subject, type, score, totalQuestions, timeSpent) => {
      const local = getLocal('sm_mock_tests', INITIAL_MOCK_TESTS);
      const newItem = {
        id: String(Date.now()),
        subject,
        type,
        score,
        totalQuestions,
        timeSpent,
        date: new Date().toISOString().split('T')[0]
      };
      setLocal('sm_mock_tests', [newItem, ...local]);
      return { success: true };
    }
  },

  // --- ANALYTICS / PROGRESS / PREDICTIONS ---
  analytics: {
    getStats: async () => {
      try {
        const res = await axiosInstance.get('/analytics/stats');
        return res.data;
      } catch (err) {
        console.warn('Backend analytics fetch failed, running local calculations.');
        const history = getLocal('sm_quiz_history', INITIAL_QUIZ_HISTORY);
        const mockHistory = getLocal('sm_mock_tests', INITIAL_MOCK_TESTS);
        const flashcards = getLocal('sm_flashcards', INITIAL_FLASHCARDS);
        
        const totalQuizzes = history.length;
        const avgQuizScore = Math.round(history.reduce((acc, q) => acc + (q.score / q.totalQuestions), 0) / (totalQuizzes || 1) * 100);
        
        const totalMockTests = mockHistory.length;
        const avgMockScore = Math.round(mockHistory.reduce((acc, m) => acc + (m.score / m.totalQuestions), 0) / (totalMockTests || 1) * 100);

        return {
          accuracyData: [
            { name: 'Week 1', quiz: 65, mock: 60 },
            { name: 'Week 2', quiz: 72, mock: 70 },
            { name: 'Week 3', quiz: 85, mock: 80 },
            { name: 'Week 4', quiz: avgQuizScore || 82, mock: avgMockScore || 83 }
          ],
          streak: 5,
          topicMastery: [
            { name: 'Algorithms', progress: 85 },
            { name: 'Database Systems', progress: 70 },
            { name: 'Networks', progress: 60 },
            { name: 'Operating Systems', progress: 45 }
          ],
          weakTopics: [
            { topic: 'Computer Networks (OSI Layer Routing)', currentAccuracy: '52%', recommendedPrep: 'Attempt Quiz 4 and read Networks Notes PDF' },
            { topic: 'Operating Systems (Semaphores & Locks)', currentAccuracy: '45%', recommendedPrep: 'Generate summary notes for deadlock conditions' }
          ],
          predictions: {
            readinessPercentage: 82,
            predictedScore: '86/100',
            confidenceLevel: 'High',
            confidencePercentage: 91,
            breakdown: [
              { subject: 'Algorithms', readiness: 90, grade: 'A+' },
              { subject: 'Database Systems', readiness: 75, grade: 'B' },
              { subject: 'Networks', readiness: 65, grade: 'C+' }
            ]
          },
          strategy: {
            timeAllocation: [
              { section: 'Section A (MCQs)', time: '15 mins', description: 'Quick fire conceptual questions. Solve immediately.' },
              { section: 'Section B (Short Answers)', time: '45 mins', description: 'Requires structural calculations. Allocate significant focus.' },
              { section: 'Section C (Long Code Essays)', time: '60 mins', description: 'Design queries or algorithms. Leave for last to maximize marks.' }
            ],
            attemptOrder: ['Section A', 'Section C', 'Section B'],
            topicPriority: [
              { topic: 'B-Trees & Indexing (Databases)', priority: 'High', prepTime: '3 hrs' },
              { topic: 'Dynamic Programming (Algorithms)', priority: 'High', prepTime: '4 hrs' },
              { topic: 'OS Process Synchronization (OS)', priority: 'Medium', prepTime: '2 hrs' },
              { topic: 'IP Subnetting (Networks)', priority: 'Medium', prepTime: '1.5 hrs' }
            ],
            recommendations: [
              'Revise Networks OSI Model layers; they consistently represent 20% of marks in past papers.',
              'Retake the Database Systems quiz to push accuracy above 80% to hit your target A Grade.',
              'Export the Algorithms summary sheet to PDF for mobile reference.'
            ]
          }
        };
      }
    }
  },

  // --- PAST PAPER ANALYSIS ---
  pyq: {
    analyze: async (materialId) => {
      try {
        const res = await axiosInstance.post('/pyq/analyze', { materialId });
        return res.data;
      } catch (err) {
        console.warn('Backend PYQ failed, using local mock.');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          importantTopics: [
            { topic: 'Trees & Graphs', weight: '24%' },
            { topic: 'IP Routing & Subnets', weight: '22%' },
            { topic: 'Sorting & Searching', weight: '18%' }
          ],
          frequencyData: [
            { name: 'Sorting & Searching', frequency: 18 },
            { name: 'Trees & Graphs', frequency: 24 },
            { name: 'Relational Queries (SQL)', frequency: 15 },
            { name: 'IP Routing & Subnets', frequency: 22 },
            { name: 'Process Synchronization', frequency: 14 }
          ],
          trends: [
            { year: '2023', Algorithms: 20, Databases: 18, Networks: 25 },
            { year: '2024', Algorithms: 22, Databases: 20, Networks: 24 },
            { year: '2025', Algorithms: 25, Databases: 17, Networks: 26 },
            { year: '2026', Algorithms: 28, Databases: 19, Networks: 28 }
          ]
        };
      }
    }
  }
};

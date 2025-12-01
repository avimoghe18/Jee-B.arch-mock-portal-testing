import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Question, ShuffledQuestion, Test, TestCategory } from '../types';

const sampleQuestions: Question[] = [
  { id: 1, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1y9-GEc4S1jDyS1WNL5OqFTRWoibym8L9&sz=w2000", optionA: "a", optionB: "d", optionC: "b", optionD: "c", correctOption: "d" },
  { id: 2, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1VypMXlWqcUFk3AHY15R5QQsr-xKhB0RZ&sz=w2000", optionA: "a", optionB: "b", optionC: "d", optionD: "c", correctOption: "d" },
  { id: 49, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1qtbOC6kN5ZVbnwI3Wo_BMthYgzats4j2&sz=w2000", optionA: "d", optionB: "c", optionC: "a", optionD: "b", correctOption: "d" },
  { id: 50, question: "Read the Instructions Carefully", image: "https://drive.google.com/thumbnail?id=1qxuTec8eNTT0xZ3nC5jpbv86TYP3Br6a&sz=w2000", optionA: "d", optionB: "c", optionC: "a", optionD: "b", correctOption: "d" }
];

const DEFAULT_TEST_DURATION = 3600;

export const testCategories: TestCategory[] = [
  { id: 'white', name: 'White Mock Tests', icon: '⚪', color: 'bg-white border-gray-300', description: 'Comprehensive mock tests' },
  { id: 'blue', name: 'Blue Mock Tests', icon: '🔵', color: 'bg-blue-50 border-blue-300', description: 'Advanced practice tests' },
  { id: 'grey', name: 'Grey Mock Tests', icon: '⚫', color: 'bg-gray-50 border-gray-300', description: 'Standard difficulty tests' },
  { id: 'pyq', name: 'PYQ (2005-2025)', icon: '📚', color: 'bg-yellow-50 border-yellow-300', description: 'Previous Year Questions' },
  { id: 'latest', name: 'Latest Pattern', icon: '🆕', color: 'bg-green-50 border-green-300', description: 'New test pattern' },
];

const initialTests: Test[] = [
  { id: 'White Mock Test 1', name: 'White Mock Test 1', description: 'Mock test based on Actual PYQ', duration: DEFAULT_TEST_DURATION, questions: sampleQuestions.slice(0, 50), category: 'white' }
];

export function shuffleOptions(question: Question): ShuffledQuestion {
  const options = [
    { text: question.optionA, originalKey: 'a' },
    { text: question.optionB, originalKey: 'b' },
    { text: question.optionC, originalKey: 'c' },
    { text: question.optionD, originalKey: 'd' }
  ];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const correctIndex = shuffled.findIndex(opt => opt.originalKey === question.correctOption);
  return {
    ...question,
    shuffledOptions: shuffled,
    correctIndex
  };
}

interface TestContextType {
  tests: Test[];
  selectedTest: Test | null;
  testStarted: boolean;
  questions: ShuffledQuestion[];
  currentQuestion: number;
  answers: Record<number, number>;
  markedForReview: Record<number, boolean>;
  visitedQuestions: Set<number>;
  timeLeft: number;
  testCompleted: boolean;
  showResults: boolean;
  violations: string[];
  tabSwitchCount: number;
  fullscreenExitCount: number;
  isFullscreen: boolean;
  screenshotBlocked: boolean;
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  setSelectedTest: React.Dispatch<React.SetStateAction<Test | null>>;
  selectTest: (test: Test) => void;
  startTest: () => boolean;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
  handleAnswer: (questionId: number, answerIndex: number) => void;
  clearResponse: () => void;
  handleSaveAndNext: () => void;
  handleMarkAndNext: () => void;
  handleSubmit: () => void;
  restartTest: () => void;
  handleQuestionNavigation: (idx: number) => void;
  addViolation: (message: string) => void;
  setTabSwitchCount: React.Dispatch<React.SetStateAction<number>>;
  setFullscreenExitCount: React.Dispatch<React.SetStateAction<number>>;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  setTestCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  setShowResults: React.Dispatch<React.SetStateAction<boolean>>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  setScreenshotBlocked: React.Dispatch<React.SetStateAction<boolean>>;
  getStatusCounts: () => { answered: number; visitedNotAnswered: number; notVisited: number; markedForReviewCount: number; answeredMarked: number };
  calculateScore: () => { correct: number; incorrect: number; unattempted: number; totalMarks: number; maxMarks: number };
  addTest: (name: string, description: string, duration: number) => { success: boolean; message: string };
  deleteTest: (testId: string) => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [tests, setTests] = useState<Test[]>(initialTests);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TEST_DURATION);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [violations, setViolations] = useState<string[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screenshotBlocked, setScreenshotBlocked] = useState(false);

  const addViolation = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setViolations(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const selectTest = (test: Test) => {
    setSelectedTest(test);
    setTimeLeft(test.duration);
  };

  const startTest = (): boolean => {
    if (selectedTest && selectedTest.questions && selectedTest.questions.length > 0) {
      try {
        const shuffled = selectedTest.questions.map(q => shuffleOptions(q));
        setQuestions(shuffled);
        setTestStarted(true);
        setCurrentQuestion(0);
        setAnswers({});
        setMarkedForReview({});
        setVisitedQuestions(new Set([0]));
        setTimeLeft(selectedTest.duration);
        setTestCompleted(false);
        setShowResults(false);
        setViolations([]);
        setTabSwitchCount(0);
        setFullscreenExitCount(0);
        setScreenshotBlocked(false);
        return true;
      } catch (error) {
        console.error("Error starting test:", error);
        return false;
      }
    }
    return false;
  };

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const clearResponse = () => {
    const qId = questions[currentQuestion]?.id;
    if (qId !== undefined) {
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[qId];
        return newAnswers;
      });
    }
  };

  const handleSaveAndNext = () => {
    if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setVisitedQuestions(prev => new Set(prev).add(nextQuestion));
    }
  };

  const handleMarkAndNext = () => {
    const qId = questions[currentQuestion]?.id;
    if (qId !== undefined) {
      setMarkedForReview(prev => ({ ...prev, [qId]: true }));
      if (currentQuestion < questions.length - 1) {
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        setVisitedQuestions(prev => new Set(prev).add(nextQuestion));
      }
    }
  };

  const handleSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    let confirmMessage = 'Are you sure you want to submit the test?';
    if (unansweredCount > 0) {
      confirmMessage = `You have ${unansweredCount} unanswered question(s). Are you sure you want to submit?`;
    }
    const confirmed = window.confirm(confirmMessage);
    if (confirmed) {
      setTestCompleted(true);
      setShowResults(true);
    }
  };

  const restartTest = () => {
    setTestStarted(false);
    setSelectedTest(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setMarkedForReview({});
    setVisitedQuestions(new Set([0]));
    setTimeLeft(DEFAULT_TEST_DURATION);
    setTestCompleted(false);
    setShowResults(false);
    setViolations([]);
    setTabSwitchCount(0);
    setFullscreenExitCount(0);
    setScreenshotBlocked(false);
  };

  const handleQuestionNavigation = (idx: number) => {
    setCurrentQuestion(idx);
    setVisitedQuestions(prev => new Set(prev).add(idx));
  };

  const getStatusCounts = () => {
    let answered = 0;
    let visitedNotAnswered = 0;
    let notVisited = 0;
    let markedForReviewCount = 0;
    let answeredMarked = 0;
    questions.forEach((q, idx) => {
      const isAnswered = answers[q.id] !== undefined;
      const isMarked = markedForReview[q.id];
      const isVisited = visitedQuestions.has(idx);
      if (isAnswered && isMarked) {
        answeredMarked++;
      } else if (isAnswered) {
        answered++;
      } else if (isMarked) {
        markedForReviewCount++;
      } else if (isVisited) {
        visitedNotAnswered++;
      } else {
        notVisited++;
      }
    });
    return { answered, visitedNotAnswered, notVisited, markedForReviewCount, answeredMarked };
  };

  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        if (answers[q.id] === q.correctIndex) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        unattempted++;
      }
    });
    const totalMarks = (correct * 4) - (incorrect * 1);
    const maxMarks = questions.length;
    return { correct, incorrect, unattempted, totalMarks, maxMarks };
  };

  const addTest = (name: string, description: string, duration: number): { success: boolean; message: string } => {
    if (!name.trim()) {
      return { success: false, message: 'Please enter test name' };
    }
    if (isNaN(duration) || duration <= 0) {
      return { success: false, message: 'Please enter a valid duration' };
    }
    const newTest: Test = {
      id: 'test' + Date.now(),
      name: name.trim(),
      description: description.trim() || 'No description',
      duration: duration * 60,
      questions: sampleQuestions
    };
    setTests(prev => [...prev, newTest]);
    return { success: true, message: `Test "${newTest.name}" added successfully!` };
  };

  const deleteTest = (testId: string) => {
    setTests(prev => prev.filter(t => t.id !== testId));
  };

  return (
    <TestContext.Provider value={{
      tests,
      selectedTest,
      testStarted,
      questions,
      currentQuestion,
      answers,
      markedForReview,
      visitedQuestions,
      timeLeft,
      testCompleted,
      showResults,
      violations,
      tabSwitchCount,
      fullscreenExitCount,
      isFullscreen,
      screenshotBlocked,
      setTests,
      setSelectedTest,
      selectTest,
      startTest,
      setCurrentQuestion,
      handleAnswer,
      clearResponse,
      handleSaveAndNext,
      handleMarkAndNext,
      handleSubmit,
      restartTest,
      handleQuestionNavigation,
      addViolation,
      setTabSwitchCount,
      setFullscreenExitCount,
      setIsFullscreen,
      setTestCompleted,
      setShowResults,
      setTimeLeft,
      setScreenshotBlocked,
      getStatusCounts,
      calculateScore,
      addTest,
      deleteTest,
    }}>
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
}

export { DEFAULT_TEST_DURATION };

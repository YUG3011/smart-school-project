import { useState, useEffect } from "react";

export default function QuizPage() {
  // Dummy questions — will later come from backend AI generator
  const questions = [
    {
      id: 1,
      question: "What is the capital of India?",
      options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
      answer: "New Delhi",
    },
    {
      id: 2,
      question: "2 + 2 = ?",
      options: ["3", "4", "5", "1"],
      answer: "4",
    },
    {
      id: 3,
      question: "Which is a programming language?",
      options: ["HTML", "Python", "CSS", "Photoshop"],
      answer: "Python",
    },
  ];

  const totalTime = 30; // in seconds
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Start timer
  useEffect(() => {
    if (!quizStarted || quizFinished) return;

    if (timeLeft === 0) {
      finishQuiz();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, quizFinished]);

  // Start quiz
  const startQuiz = () => {
    setQuizStarted(true);
  };

  // Next question
  const nextQuestion = () => {
    if (selected === questions[currentQuestion].answer) {
      setScore(score + 1);
    }

    setSelected("");

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  // Finish quiz
  const finishQuiz = () => {
    setQuizFinished(true);
    setQuizStarted(false);
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Quiz</h1>

      {/* START SCREEN */}
      {!quizStarted && !quizFinished && (
        <button
          onClick={startQuiz}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded"
        >
          Start Quiz
        </button>
      )}

      {/* QUIZ SCREEN */}
      {quizStarted && !quizFinished && (
        <div className="bg-white p-6 rounded shadow w-full md:w-2/3">

          {/* TIMER */}
          <div className="text-right font-semibold text-red-500 mb-4">
            Time Left: {timeLeft}s
          </div>

          {/* QUESTION */}
          <h2 className="text-xl font-semibold mb-3">
            Q{currentQuestion + 1}. {questions[currentQuestion].question}
          </h2>

          {/* OPTIONS */}
          <div className="flex flex-col gap-3">
            {questions[currentQuestion].options.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelected(opt)}
                className={`border p-3 rounded text-left 
                  ${selected === opt ? "bg-blue-100 border-blue-500" : ""}`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={nextQuestion}
            disabled={!selected}
            className="mt-5 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* RESULT SCREEN */}
      {quizFinished && (
        <div className="bg-white p-6 rounded shadow w-full md:w-2/3">
          <h2 className="text-2xl font-bold mb-4">Quiz Finished 🎉</h2>

          <p className="text-xl mb-2">Your Score:</p>
          <p className="text-3xl font-bold text-green-600 mb-4">
            {score} / {questions.length}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded"
          >
            Restart Quiz
          </button>
        </div>
      )}
    </div>
  );
}

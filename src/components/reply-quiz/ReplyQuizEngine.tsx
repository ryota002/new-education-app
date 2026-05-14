"use client";

import { useState, useRef } from "react";
import {
  type GameType,
  type PlayMode,
  type QuizQuestion,
  type QuizOption,
  type SelfEval,
  getQuestions,
  gameTypeLabels,
  gameTypeDescriptions,
  playModeLabels,
  playModeDescriptions,
} from "@/data/reply-quiz-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

// ─── 型 ────────────────────────────────────────
type AppPhase = "start" | "quiz" | "result";
type QuizPhase = "question" | "feedback";

interface QuizRecord {
  questionId: number;
  score?: number;        // 選択モード用
  selfEval?: SelfEval;   // 自分で書くモード用
}

// ─── スコアバッジ ─────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) return <span className="text-emerald-600 font-bold">ベスト ({score}点)</span>;
  if (score >= 50) return <span className="text-amber-600 font-bold">まずまず ({score}点)</span>;
  return <span className="text-red-500 font-bold">要改善 ({score}点)</span>;
}

// ─── スタート画面 ─────────────────────────────
function StartScreen({
  onStart,
}: {
  onStart: (gameType: GameType, playMode: PlayMode) => void;
}) {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [selectedMode, setSelectedMode] = useState<PlayMode | null>(null);

  const gameTypes: GameType[] = ["nihou", "normal", "special"];
  const playModes: PlayMode[] = ["write", "select"];

  const gameIcons: Record<GameType, string> = {
    nihou: "📝",
    normal: "💬",
    special: "🎭",
  };

  const modeIcons: Record<PlayMode, string> = {
    write: "✍️",
    select: "☑️",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">受講生対応トレーニング</h1>
          <p className="text-sm text-muted-foreground">
            受講生へのメッセージ返信力を磨きましょう
          </p>
        </div>

        {/* ゲーム種類 */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">① ゲームの種類を選んでください</p>
          <div className="grid gap-2">
            {gameTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedGame(type)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  selectedGame === type
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{gameIcons[type]}</span>
                  <div>
                    <p className="font-semibold">{gameTypeLabels[type]}</p>
                    <p className="text-xs text-muted-foreground">{gameTypeDescriptions[type]}</p>
                  </div>
                  {selectedGame === type && (
                    <span className="ml-auto text-primary font-bold">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* モード選択 */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">② モードを選んでください</p>
          <div className="grid grid-cols-2 gap-3">
            {playModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`text-left rounded-xl border-2 p-4 transition-all ${
                  selectedMode === mode
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="space-y-1">
                  <p className="text-xl">{modeIcons[mode]}</p>
                  <p className="font-semibold text-sm">{playModeLabels[mode]}</p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {playModeDescriptions[mode]}
                  </p>
                  {selectedMode === mode && (
                    <p className="text-primary text-xs font-bold">選択中 ✓</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!selectedGame || !selectedMode}
          onClick={() => {
            if (selectedGame && selectedMode) onStart(selectedGame, selectedMode);
          }}
        >
          {selectedGame && selectedMode
            ? `${gameTypeLabels[selectedGame]}・${playModeLabels[selectedMode]}でスタート →`
            : "種類とモードを選んでください"}
        </Button>
      </div>
    </div>
  );
}

// ─── 選択モード：問題カード ────────────────────
function SelectQuestionCard({
  question,
  questionNumber,
  total,
  onSelect,
}: {
  question: QuizQuestion;
  questionNumber: number;
  total: number;
  onSelect: (option: QuizOption) => void;
}) {
  return (
    <div className="space-y-5">
      <Header question={question} questionNumber={questionNumber} total={total} />
      <MessageBox question={question} />
      <div className="space-y-3">
        <p className="text-sm font-semibold">どう返信しますか？</p>
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            className="w-full text-left rounded-xl border bg-card p-4 hover:border-primary hover:bg-primary/5 transition-colors group"
          >
            <div className="flex gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                {option.id}
              </span>
              <span className="text-sm leading-relaxed whitespace-pre-line">{option.text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 選択モード：フィードバックカード ──────────
function SelectFeedbackCard({
  question,
  selected,
  onNext,
  isLast,
}: {
  question: QuizQuestion;
  selected: QuizOption;
  onNext: () => void;
  isLast: boolean;
}) {
  const bestOption = question.options.reduce((a, b) => (a.score > b.score ? a : b));
  const isCorrect = selected.id === bestOption.id;

  return (
    <div className="space-y-5">
      <div
        className={`rounded-xl border-2 p-5 ${
          isCorrect ? "border-emerald-400 bg-emerald-50" : "border-amber-400 bg-amber-50"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{isCorrect ? "🎉" : "💡"}</span>
          <p className="font-bold text-lg">
            {isCorrect ? "ベストな返信です！" : "惜しい！もう少し良い返し方があります"}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          あなたの選択:{" "}
          <span className="font-medium text-foreground">
            {selected.id}. {selected.text}
          </span>
        </p>
        <div className="mt-2">
          スコア: <ScoreBadge score={selected.score} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">各選択肢のフィードバック</p>
        {question.options.map((option) => (
          <div
            key={option.id}
            className={`rounded-lg border p-4 space-y-1.5 ${
              option.id === bestOption.id
                ? "border-emerald-300 bg-emerald-50/50"
                : option.id === selected.id
                ? "border-amber-300 bg-amber-50/50"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {option.id}
              </span>
              <div className="space-y-1 flex-1">
                <p className="text-sm whitespace-pre-line">{option.text}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <ScoreBadge score={option.score} />
                  {option.id === bestOption.id && (
                    <span className="text-xs text-emerald-600 font-semibold">← ベスト回答</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{option.feedback}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* お手本 */}
      <div className="rounded-lg border bg-blue-50 border-blue-200 p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-800">📝 お手本の返信</p>
        <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
          {question.modelAnswer}
        </p>
        <div className="border-t border-blue-200 pt-2 mt-2">
          <p className="text-xs text-blue-700 leading-relaxed">
            💬 {question.modelAnswerComment}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-slate-50 p-4">
        <p className="text-sm font-semibold mb-1">💡 ポイント</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {question.bestAnswerExplanation}
        </p>
      </div>

      <Button onClick={onNext} className="w-full" size="lg">
        {isLast ? "結果を見る" : "次の問題へ →"}
      </Button>
    </div>
  );
}

// ─── 自分で書くモード：入力カード ──────────────
function WriteQuestionCard({
  question,
  questionNumber,
  total,
  onSubmit,
}: {
  question: QuizQuestion;
  questionNumber: number;
  total: number;
  onSubmit: (answer: string) => void;
}) {
  const [answer, setAnswer] = useState("");

  return (
    <div className="space-y-5">
      <Header question={question} questionNumber={questionNumber} total={total} />
      <MessageBox question={question} />
      <div className="space-y-2">
        <p className="text-sm font-semibold">あなたの返信を書いてください</p>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="ここに返信を入力してください…"
          className="min-h-[160px] text-sm leading-relaxed"
        />
      </div>
      <Button
        onClick={() => onSubmit(answer)}
        className="w-full"
        size="lg"
        disabled={answer.trim().length === 0}
      >
        お手本と比べる →
      </Button>
    </div>
  );
}

// ─── 自分で書くモード：お手本比較カード ────────
function WriteCompareCard({
  question,
  written,
  onEval,
}: {
  question: QuizQuestion;
  written: string;
  onEval: (eval_: SelfEval) => void;
}) {
  const evalOptions: { key: SelfEval; label: string; emoji: string; color: string }[] = [
    { key: "perfect", label: "完璧！", emoji: "🎉", color: "bg-emerald-50 border-emerald-400 hover:bg-emerald-100" },
    { key: "ok", label: "だいたい合ってた", emoji: "👍", color: "bg-amber-50 border-amber-400 hover:bg-amber-100" },
    { key: "needmore", label: "要練習", emoji: "💪", color: "bg-rose-50 border-rose-400 hover:bg-rose-100" },
  ];

  return (
    <div className="space-y-5">
      {/* あなたの返信 */}
      <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">あなたの返信</p>
        <p className="text-sm leading-relaxed whitespace-pre-line">{written || "（未記入）"}</p>
      </div>

      {/* お手本 */}
      <div className="rounded-xl border bg-blue-50 border-blue-200 p-4 space-y-2">
        <p className="text-xs font-semibold text-blue-700">📝 お手本の返信</p>
        <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
          {question.modelAnswer}
        </p>
        <div className="border-t border-blue-200 pt-2 mt-2">
          <p className="text-xs text-blue-700 leading-relaxed">
            💬 {question.modelAnswerComment}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-slate-50 p-4">
        <p className="text-sm font-semibold mb-1">💡 ポイント</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {question.bestAnswerExplanation}
        </p>
      </div>

      {/* 自己評価 */}
      <div className="space-y-3">
        <p className="text-sm font-semibold">お手本と比べてどうでしたか？</p>
        <div className="grid gap-2">
          {evalOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onEval(opt.key)}
              className={`rounded-xl border-2 p-3 flex items-center gap-3 transition-all ${opt.color}`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="font-semibold text-sm">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 共通：ヘッダー ────────────────────────────
function Header({
  question,
  questionNumber,
  total,
}: {
  question: QuizQuestion;
  questionNumber: number;
  total: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{question.category}</Badge>
        <span className="text-sm text-muted-foreground">
          {questionNumber} / {total}
        </span>
      </div>
      <Progress value={(questionNumber / total) * 100} className="h-1.5" />
    </div>
  );
}

// ─── 共通：メッセージボックス ──────────────────
function MessageBox({ question }: { question: QuizQuestion }) {
  return (
    <div className="rounded-xl border bg-muted/40 p-5 space-y-3">
      {question.situation && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">📋 状況</p>
          <p className="text-sm text-amber-900 leading-relaxed">{question.situation}</p>
        </div>
      )}
      <div className="rounded-lg bg-background border p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-1.5">
          受講生からのメッセージ
        </p>
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {question.traineeMessage === "（3日間連絡・ログインなし）" ||
          question.traineeMessage === "（1週間連絡なし）" ||
          question.traineeMessage === "（2週間連絡なし・以前に体調不良の連絡あり）" ? (
            <span className="text-muted-foreground italic">{question.traineeMessage}</span>
          ) : (
            question.traineeMessage
          )}
        </p>
      </div>
    </div>
  );
}

// ─── 結果画面 ─────────────────────────────────
function ResultScreen({
  records,
  questions,
  gameType,
  playMode,
  onRestart,
  onBack,
}: {
  records: QuizRecord[];
  questions: QuizQuestion[];
  gameType: GameType;
  playMode: PlayMode;
  onRestart: () => void;
  onBack: () => void;
}) {
  const isSelect = playMode === "select";

  const avgScore = isSelect
    ? Math.round(
        records.reduce((sum, r) => sum + (r.score ?? 0), 0) / records.length
      )
    : null;

  const bestCount = isSelect
    ? records.filter((r) => {
        const q = questions.find((q) => q.id === r.questionId)!;
        const best = Math.max(...q.options.map((o) => o.score));
        return (r.score ?? 0) >= best;
      }).length
    : null;

  const evalCounts = !isSelect
    ? {
        perfect: records.filter((r) => r.selfEval === "perfect").length,
        ok: records.filter((r) => r.selfEval === "ok").length,
        needmore: records.filter((r) => r.selfEval === "needmore").length,
      }
    : null;

  const getSelectMessage = (score: number) => {
    if (score >= 90) return { emoji: "🏆", text: "素晴らしい！受講生への向き合い方が身についています。" };
    if (score >= 70) return { emoji: "👍", text: "概ね良好です。お手本の返しをもう一度確認してみましょう。" };
    if (score >= 50) return { emoji: "📚", text: "基本的な考え方は理解できています。実践で磨いていきましょう。" };
    return { emoji: "💪", text: "受講生の気持ちに寄り添うことを意識して、再挑戦してみましょう！" };
  };

  const getWriteMessage = () => {
    const p = evalCounts!;
    if (p.perfect >= 7) return { emoji: "🏆", text: "お手本に近い返しが多くできています！自信を持ちましょう。" };
    if (p.perfect + p.ok >= 7) return { emoji: "👍", text: "良い返しが多くできています。苦手な部分を重点練習しましょう。" };
    return { emoji: "💪", text: "お手本と比較しながら、返しの型を身につけていきましょう！" };
  };

  const msg = isSelect ? getSelectMessage(avgScore!) : getWriteMessage();

  return (
    <div className="space-y-6 text-center">
      <div>
        <p className="text-5xl mb-3">{msg.emoji}</p>
        <h2 className="text-2xl font-bold">トレーニング終了！</h2>
        <p className="text-xs font-medium text-muted-foreground mt-2">
          {gameTypeLabels[gameType]} / {playModeLabels[playMode]}
        </p>
        <p className="text-muted-foreground mt-1 text-sm">{msg.text}</p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        {isSelect ? (
          <>
            <div>
              <p className="text-sm text-muted-foreground">平均スコア</p>
              <p className="text-5xl font-bold mt-1">
                {avgScore}
                <span className="text-2xl text-muted-foreground">点</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-muted-foreground text-xs">ベスト回答数</p>
                <p className="text-2xl font-bold mt-1">
                  {bestCount}
                  <span className="text-base text-muted-foreground"> / {questions.length}</span>
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-muted-foreground text-xs">問題数</p>
                <p className="text-2xl font-bold mt-1">{questions.length}</p>
              </div>
            </div>
            <div className="space-y-2 text-left">
              <p className="text-sm font-semibold">問題別スコア</p>
              {records.map((r, i) => {
                const q = questions.find((q) => q.id === r.questionId)!;
                return (
                  <div key={r.questionId} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <Progress value={r.score ?? 0} className="flex-1 h-2" />
                    <span className="text-xs font-medium w-12 text-right">{r.score}点</span>
                    <span className="text-xs text-muted-foreground w-28 truncate text-left">
                      {q.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground font-medium">自己評価まとめ</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "perfect", label: "完璧！", emoji: "🎉", count: evalCounts!.perfect },
                { key: "ok", label: "だいたい合ってた", emoji: "👍", count: evalCounts!.ok },
                { key: "needmore", label: "要練習", emoji: "💪", count: evalCounts!.needmore },
              ].map((item) => (
                <div key={item.key} className="rounded-lg bg-muted p-3">
                  <p className="text-xl">{item.emoji}</p>
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid gap-3">
        <Button onClick={onRestart} className="w-full" size="lg">
          もう一度挑戦する
        </Button>
        <Button onClick={onBack} className="w-full" size="lg" variant="outline">
          スタート画面に戻る
        </Button>
      </div>
    </div>
  );
}

// ─── メインコンポーネント ──────────────────────
export default function ReplyQuizEngine() {
  const [appPhase, setAppPhase] = useState<AppPhase>("start");
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [playMode, setPlayMode] = useState<PlayMode | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizPhase, setQuizPhase] = useState<QuizPhase>("question");
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [records, setRecords] = useState<QuizRecord[]>([]);
  const topRef = useRef<HTMLDivElement>(null);

  const scrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStart = (gt: GameType, pm: PlayMode) => {
    const qs = getQuestions(gt);
    // ランダムに10問選ぶ
    const shuffled = [...qs].sort(() => Math.random() - 0.5).slice(0, 10);
    setGameType(gt);
    setPlayMode(pm);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setQuizPhase("question");
    setSelectedOption(null);
    setWrittenAnswer("");
    setRecords([]);
    setAppPhase("quiz");
    setTimeout(scrollTop, 100);
  };

  const handleSelectOption = (option: QuizOption) => {
    setSelectedOption(option);
    setRecords((prev) => [
      ...prev,
      { questionId: questions[currentIndex].id, score: option.score },
    ]);
    setQuizPhase("feedback");
    setTimeout(scrollTop, 50);
  };

  const handleWriteSubmit = (answer: string) => {
    setWrittenAnswer(answer);
    setQuizPhase("feedback");
    setTimeout(scrollTop, 50);
  };

  const handleSelfEval = (eval_: SelfEval) => {
    setRecords((prev) => [
      ...prev,
      { questionId: questions[currentIndex].id, selfEval: eval_ },
    ]);
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setAppPhase("result");
    } else {
      setCurrentIndex((i) => i + 1);
      setQuizPhase("question");
      setSelectedOption(null);
      setWrittenAnswer("");
    }
    setTimeout(scrollTop, 50);
  };

  const handleRestart = () => {
    if (gameType && playMode) {
      handleStart(gameType, playMode);
    }
  };

  const handleBack = () => {
    setAppPhase("start");
    setGameType(null);
    setPlayMode(null);
    setRecords([]);
  };

  // スタート画面
  if (appPhase === "start") {
    return <StartScreen onStart={handleStart} />;
  }

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex + 1 >= questions.length;

  return (
    <div className="min-h-screen bg-background" ref={topRef}>
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        {appPhase === "quiz" && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold">受講生対応トレーニング</h1>
              <p className="text-xs text-muted-foreground">
                {gameType && gameTypeLabels[gameType]} ・{" "}
                {playMode && playModeLabels[playMode]}
              </p>
            </div>
            <button
              onClick={handleBack}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← 戻る
            </button>
          </div>
        )}

        {/* クイズ画面 */}
        {appPhase === "quiz" && currentQuestion && (
          <>
            {playMode === "select" ? (
              quizPhase === "question" ? (
                <SelectQuestionCard
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  total={questions.length}
                  onSelect={handleSelectOption}
                />
              ) : (
                <SelectFeedbackCard
                  question={currentQuestion}
                  selected={selectedOption!}
                  onNext={handleNext}
                  isLast={isLast}
                />
              )
            ) : quizPhase === "question" ? (
              <WriteQuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                total={questions.length}
                onSubmit={handleWriteSubmit}
              />
            ) : (
              <WriteCompareCard
                question={currentQuestion}
                written={writtenAnswer}
                onEval={handleSelfEval}
              />
            )}
          </>
        )}

        {/* 結果画面 */}
        {appPhase === "result" && (
          <ResultScreen
            records={records}
            questions={questions}
            gameType={gameType!}
            playMode={playMode!}
            onRestart={handleRestart}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}

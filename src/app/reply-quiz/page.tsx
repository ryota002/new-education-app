import ReplyQuizEngine from "@/components/reply-quiz/ReplyQuizEngine";

export const metadata = {
  title: "受講生返信クイズ",
  description: "受講生からのメッセージに対して、最適な返信を練習しましょう。",
};

export default function ReplyQuizPage() {
  return <ReplyQuizEngine />;
}

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { useChatContext } from "@/contexts/chat-context";
import { requestWorkerAnalysis } from "@/lib/worker-chat";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AIChat() {
  const { isOpen, initialMessage, openChat, closeChat, clearInitialMessage } = useChatContext();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isSending]);

  const handleSend = useCallback(
    async (overrideInput?: string) => {
      const text = (overrideInput ?? input).trim();
      if (!text || isSending) return;

      const userMsg: ChatMessage = { role: "user", content: text };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");

      setIsSending(true);
      try {
        const conversation = newMessages
          .slice(-4)
          .map((message) => {
            const speaker = message.role === "user" ? "사용자" : "AI";
            return `${speaker}: ${message.content.slice(0, 600)}`;
          })
          .join("\n\n");
        const response = await requestWorkerAnalysis(
          `현재 페이지: ${location}\n\n다음 대화에 한국어로 답변해주세요.\n\n${conversation}`,
        );
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response || "답변을 생성하지 못했습니다. 다시 시도해주세요." },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [input, isSending, location, messages]
  );

  useEffect(() => {
    if (initialMessage && isOpen) {
      clearInitialMessage();
      void handleSend(initialMessage);
    }
  }, [initialMessage, isOpen, clearInitialMessage, handleSend]);

  return (
    <>
      <Button
        onClick={() => openChat()}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 z-50 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] shadow-2xl flex flex-col z-50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-muted/30">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI 정책 어시스턴트
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={closeChat}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 py-8">
                  <Bot className="h-12 w-12 text-muted" />
                  <p className="text-sm">
                    프랑스 공공데이터 포털에 대해 무엇이든 물어보세요.
                  </p>
                  <div className="flex flex-col gap-2 w-full mt-4">
                    {["한국과 프랑스의 공공데이터 정책 차이는?", "Etalab은 어떤 역할을 하나요?"].map(
                      (suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          className="text-xs justify-start h-auto py-2 whitespace-normal text-left"
                          onClick={() => setInput(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex gap-3 flex-row">
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-muted text-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg px-3 py-2 text-sm bg-muted/50 text-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      답변 생성 중...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t bg-background mt-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 pb-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 — 페이지 없음</h1>
          </div>
          <p className="text-sm text-gray-600">
            요청하신 페이지를 찾을 수 없습니다.
          </p>
          <Button asChild variant="outline">
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

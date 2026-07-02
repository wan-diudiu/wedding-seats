import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, MapPin, Sparkles, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-wedding-red text-shadow-gold">
          婚礼座位管理系统
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          智能排座 · 实时协作 · 喜庆典雅
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card className="wedding-gold-border hover:shadow-lg transition-shadow">
          <CardHeader>
            <Users className="w-8 h-8 text-wedding-red mb-2" />
            <CardTitle>宾客管理</CardTitle>
            <CardDescription>添加、编辑、管理宾客信息</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/guests">
              <Button className="w-full wedding-red-gradient text-white">
                进入管理
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="wedding-gold-border hover:shadow-lg transition-shadow">
          <CardHeader>
            <MapPin className="w-8 h-8 text-wedding-gold mb-2" />
            <CardTitle>座位安排</CardTitle>
            <CardDescription>拖拽排座，实时同步</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/seating">
              <Button className="w-full wedding-gold-gradient text-white">
                开始排座
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="wedding-gold-border hover:shadow-lg transition-shadow">
          <CardHeader>
            <Sparkles className="w-8 h-8 text-wedding-red mb-2" />
            <CardTitle>智能功能</CardTitle>
            <CardDescription>自动分组、冲突检测、导出</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/seating">
              <Button variant="outline" className="w-full border-wedding-gold text-wedding-gold-dark hover:bg-wedding-gold/10">
                探索功能
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-8 text-sm text-muted-foreground">
        <Heart className="w-4 h-4 inline text-wedding-red mx-1" />
        祝新人百年好合，永结同心
        <Heart className="w-4 h-4 inline text-wedding-red mx-1" />
      </div>
    </div>
  );
}

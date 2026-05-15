import { useEffect, useState } from "react";
import type { HomeViewData } from "../types/home.types";

const PRIMARY = "#4E5B92";

const HOME_DATA: HomeViewData = {
  continueLesson: {
    courseTitle: "أساسيات النحو العربي",
    lessonTitle: "الدرس الخامس: المفعول به وأنواعه",
    progress: 42,
    totalLessons: 24,
    completedLessons: 10,
    image:
      "https://images.unsplash.com/photo-1771909752761-d26abe4e60ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBjYWxsaWdyYXBoeSUyMGFydCUyMGVsZWdhbnR8ZW58MXx8fHwxNzc2Njg1MjU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  enrolledCourses: [
    { id: 1, title: "أساسيات النحو العربي", subtitle: "قواعد وتطبيقات شاملة", progress: 42, lessons: 24, image: "https://images.unsplash.com/photo-1771909752761-d26abe4e60ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBjYWxsaWdyYXBoeSUyMGFydCUyMGVsZWdhbnR8ZW58MXx8fHwxNzc2Njg1MjU1fDA&ixlib=rb-4.1.0&q=80&w=1080", tag: "نشط", tagColor: PRIMARY },
    { id: 2, title: "مهارات الكتابة الإبداعية", subtitle: "من الفكرة إلى النص المتكامل", progress: 78, lessons: 18, image: "https://images.unsplash.com/photo-1623314556929-69d34cb19010?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBsYW5ndWFnZSUyMGxlYXJuaW5nJTIwc3R1ZHklMjBib29rc3xlbnwxfHx8fDE3NzY2ODUyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080", tag: "متقدم", tagColor: "#27AE60" },
    { id: 3, title: "فن التلاوة والتجويد", subtitle: "أحكام التجويد مع التطبيق العملي", progress: 15, lessons: 30, image: "https://images.unsplash.com/photo-1626792504254-c564b7f046a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxRdXJhbiUyMHJlY2l0YXRpb24lMjBJc2xhbWljJTIwbGl0ZXJhdHVyZXxlbnwxfHx8fDE3NzY2ODUyNjB8MA&ixlib=rb-4.1.0&q=80&w=1080", tag: "جديد", tagColor: "#E8A020" },
    { id: 4, title: "الشعر العربي الكلاسيكي", subtitle: "الأوزان والبحور وأعلام الشعراء", progress: 60, lessons: 20, image: "https://images.unsplash.com/photo-1622137879013-beaca5144a4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBwb2V0cnklMjBsaXRlcmF0dXJlJTIwbWFudXNjcmlwdHxlbnwxfHx8fDE3NzY2ODUyNjF8MA&ixlib=rb-4.1.0&q=80&w=1080", tag: "نشط", tagColor: PRIMARY },
  ],
  recommendations: [
    { id: 1, title: "البلاغة العربية المتقدمة", desc: "استكشف أسرار البيان والبديع والمعاني في الأدب العربي", level: "متوسط", levelColor: "#E8A020", rating: 4.8, hours: 14, image: "https://images.unsplash.com/photo-1715163545155-dbf1680462ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjB3cml0aW5nJTIwZ3JhbW1hciUyMGxpbmd1aXN0aWNzfGVufDF8fHx8MTc3NjY4NTI2MHww&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 2, title: "اللغة العربية للأعمال", desc: "مهارات التواصل المهني والكتابة الرسمية في بيئة الأعمال", level: "مبتدئ", levelColor: "#27AE60", rating: 4.6, hours: 10, image: "https://images.unsplash.com/photo-1762330918491-f4288a62adb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGVkdWNhdGlvbiUyMGRpZ2l0YWwlMjBjb3Vyc2V8ZW58MXx8fHwxNzc2Njg1MjY2fDA&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 3, title: "الحضارة العربية الإسلامية", desc: "رحلة عبر التاريخ والتراث والإسهامات الإنسانية الكبرى", level: "مبتدئ", levelColor: "#27AE60", rating: 4.9, hours: 18, image: "https://images.unsplash.com/photo-1762380371789-faf81ed3675d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBjdWx0dXJlJTIwaGVyaXRhZ2UlMjBhcmNoaXRlY3R1cmUlMjBnZW9tZXRyaWN8ZW58MXx8fHwxNzc2Njg1MjY1fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  ],
};

export function useHome() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return {
    isLoading,
    data: HOME_DATA,
  };
}

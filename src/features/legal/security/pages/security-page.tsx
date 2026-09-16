import { Link } from "react-router";
import { ShieldCheck } from "lucide-react";
import {
  LegalDraftShell,
  LegalGapNote,
  LegalGapsSection,
  LegalList,
  LegalParagraph,
  LegalSection,
  type LegalDraftTocItem,
} from "@/features/legal/components/legal-draft-shell";
import { PRIMARY, TEXT, TEXT_LIGHT } from "@/features/landing/components/theme";
import { paths } from "@/shared/navigation/paths";

/*
  The design this page was drawn from ("Security.dc.html") hardcoded a public mailbox —
  security@manara-edu.com — as the vulnerability-reporting channel. backend-foundation/SECURITY.md
  (the real, already-in-force policy) explicitly and deliberately does NOT publish one: "A
  dedicated security mailbox is not published here on purpose. Advertising an address that turns
  out to be unmonitored is worse than advertising none." It routes reporters to GitHub Security
  Advisories instead, with a public-issue fallback for anyone who cannot reach GitHub. That real
  policy is what section 5 below reflects — the design's mailbox was not implemented.
*/

const SECURITY_ADVISORY_URL = "https://github.com/Manara-Education/backend-foundation/security/advisories/new";
const SECURITY_ISSUES_URL = "https://github.com/Manara-Education/backend-foundation/issues/new";

const TOC: LegalDraftTocItem[] = [
  { id: "section-1", number: 1, title: "النطاق ومنهج الأمان" },
  { id: "section-2", number: 2, title: "أمان الحساب وكلمة المرور" },
  { id: "section-3", number: 3, title: "حماية البيانات" },
  { id: "section-4", number: 4, title: "أمان المدفوعات" },
  { id: "section-5", number: 5, title: "الإبلاغ عن مشكلة أمنية" },
  { id: "section-6", number: 6, title: "التحديثات والتواصل" },
];

const linkStyle = { color: PRIMARY, fontWeight: 600, textDecoration: "none", borderBlockEnd: "1px solid rgba(78,91,146,0.35)" } as const;

export function SecurityPage() {
  return (
    <LegalDraftShell
      title="سياسة الأمان"
      intro="توضّح هذه الصفحة كيف نتعامل مع أمان الحسابات والبيانات والمدفوعات على منارة، وكيف تُبلغنا عن مشكلة أمنية. النص الحالي مسودة تقتصر على ما هو مطبَّق فعلًا في المنصة؛ ولا يتضمّن أي وعد بشهادات أو تدقيق أو ضمان أمان مطلق."
      tocLabel="محتويات سياسة الأمان"
      toc={TOC}
    >
      <LegalSection id="section-1" title="1. النطاق ومنهج الأمان">
        <LegalParagraph>
          تسري هذه السياسة على موقع منارة وحسابات المستخدمين عليه وعمليات الشراء التي تجري من خلاله. ومنهجنا بسيط: تقليل ما يُخزَّن في المتصفح، وإبقاء إدارة الجلسات على الخادم، وعدم تجاوز ما نستطيع التحقق منه عند الحديث عن الأمان.
        </LegalParagraph>
        <LegalParagraph>لا تذكر هذه الصفحة أي شهادة أو تدقيق خارجي أو برنامج مكافآت للثغرات، ولا تصف المنصة بأنها آمنة تمامًا — لا يوجد نظام كذلك.</LegalParagraph>
      </LegalSection>

      <LegalSection id="section-2" title="2. أمان الحساب وكلمة المرور">
        <LegalList
          items={[
            "اختر كلمة مرور قوية وخاصة بمنارة فقط، ولا تعد استخدام كلمة مرور من موقع آخر.",
            "حسابك شخصي؛ ولا يجوز مشاركته أو إتاحته للآخرين للوصول إلى المحتوى المدفوع، كما توضّح الشروط والأحكام في القسم 2.",
            "إن اشتبهت في استخدام حسابك دون إذنك، غيّر كلمة المرور وأبلغنا فورًا.",
            "تنتهي جلسة الدخول بعد فترة من عدم النشاط، ويُطلب منك تسجيل الدخول مرة أخرى.",
            "لا يطلب منك فريق منارة كلمة المرور أو رمز التحقق في أي رسالة أو محادثة. ولا يطلب أي نموذج على الموقع بيانات بطاقتك البنكية خارج صفحة الدفع لدى مزوّد الدفع.",
          ]}
        />
      </LegalSection>

      <LegalSection id="section-3" title="3. حماية البيانات">
        <LegalParagraph>ما يمكننا تأكيده عن التطبيق كما هو مبنيّ اليوم:</LegalParagraph>
        <LegalList
          items={[
            "جلسة الدخول تُدار على الخادم، ورمزها يُحفظ في ملف تعريف ارتباط لا يمكن لواجهة الموقع قراءته.",
            "لا يُخزَّن أي رمز دخول في ذاكرة المتصفح المحلية أو ذاكرة الجلسة.",
            "كل طلب يغيّر بيانات يحمل رمز حماية من الطلبات المزوّرة، ويُرفض دونه.",
            "في بيئة التشغيل، تُرسل ملفات تعريف الارتباط عبر اتصال مُؤمَّن فقط.",
            "الوصول إلى صفحات المتعلّم والمدرّس محكوم بدور الحساب، ويُرفض ما هو خارج نطاقه.",
          ]}
        />
        <LegalGapNote>قيد التحديد: ممارسات تشفير البيانات المخزَّنة، والنسخ الاحتياطي، وإدارة صلاحيات الوصول الداخلي، وسجلات المراجعة. لا تُضاف أي عبارة عن هذه الجوانب قبل التحقق منها مع فريق التشغيل.</LegalGapNote>
      </LegalSection>

      <LegalSection id="section-4" title="4. أمان المدفوعات">
        <LegalParagraph>
          تُعالج المدفوعات الإلكترونية عبر كاشير، كما توضّح الشروط والأحكام في القسم 4. تُدخل بيانات الدفع لدى مزوّد الدفع ووفق ضوابطه، ولا تُخزَّن بيانات بطاقتك على أنظمة منارة.
        </LegalParagraph>
        <LegalParagraph>
          عند الاسترداد، يُعاد المبلغ عبر وسيلة الدفع الأصلية نفسها، وهو ما يوضّحه القسم 7 من الشروط. ولمعرفة مهل الإلغاء والاسترداد، راجع{" "}
          <Link to={`${paths.terms}#section-6`} style={linkStyle}>
            سياسة الإلغاء والاسترداد
          </Link>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="section-5" title="5. الإبلاغ عن مشكلة أمنية">
        <LegalParagraph>
          نراجع البلاغات الأمنية عبر{" "}
          <a href={SECURITY_ADVISORY_URL} target="_blank" rel="noreferrer" style={linkStyle}>
            GitHub Security Advisories
          </a>{" "}
          — قناة خاصة لا يراها إلا فريق الصيانة. لا نعلن هنا عن بريد أمني مخصّص عمدًا: عنوان غير مراقَب أسوأ من عدم وجود عنوان، ومَن يبلّغ عن ثغرة يستحق أن يصل بلاغه فعليًا.
        </LegalParagraph>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "16px 18px", borderRadius: 14, background: "#F8F9FD", border: "1px solid rgba(78,91,146,0.12)" }}>
          <span style={{ inlineSize: 38, blockSize: 38, borderRadius: 12, background: "rgba(78,91,146,0.08)", color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShieldCheck size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span style={{ minInlineSize: 0 }}>
            <span style={{ display: "block", fontSize: 12.5, color: TEXT_LIGHT, lineHeight: 1.6 }}>قناة الإبلاغ الأمني</span>
            <a href={SECURITY_ADVISORY_URL} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", minBlockSize: 36, fontSize: 15, fontWeight: 700, color: TEXT, textDecoration: "none", overflowWrap: "anywhere" }}>
              GitHub Security Advisories — backend-foundation
            </a>
          </span>
        </div>
        <LegalParagraph>
          إن تعذّر عليك استخدام GitHub Advisories، افتح{" "}
          <a href={SECURITY_ISSUES_URL} target="_blank" rel="noreferrer" style={linkStyle}>
            تذكرة عامة
          </a>{" "}
          لا تذكر أي تفاصيل عن الثغرة، واطلب فيها فقط قناة تواصل خاصة، وسيتواصل معك أحد فريق الصيانة. يمكنك أيضًا استخدام{" "}
          <Link to={paths.contact} style={linkStyle}>
            صفحة تواصل معنا
          </Link>{" "}
          واختيار «مشكلة تقنية» بالطريقة نفسها — بلا تفاصيل عن الثغرة في النص المفتوح.
        </LegalParagraph>
        <LegalParagraph>
          يساعدنا في المراجعة: وصف الخطوات التي تؤدي إلى المشكلة، ووقت ملاحظتها، والصفحة التي ظهرت فيها. لا ترسل كلمات مرور أو بيانات بطاقات في رسالتك، ولا تستخدم بيانات مستخدمين آخرين أثناء الاختبار.
        </LegalParagraph>
        <LegalParagraph>نطلب منك عدم نشر تفاصيل الثغرة قبل معالجتها، حتى لا تتعرّض حسابات المستخدمين للخطر.</LegalParagraph>
        <LegalGapNote>قيد التحديد: مهلة الإقرار باستلام البلاغ كوقت محدد منشور هنا. الالتزامات الزمنية الفعلية (ثلاثة أيام عمل للرد الأول، سبعة للتقييم) موثّقة في SECURITY.md بمستودع الواجهة الخلفية.</LegalGapNote>
      </LegalSection>

      <LegalSection id="section-6" title="6. التحديثات والتواصل">
        <LegalParagraph>
          تُحدَّث هذه السياسة عند تغيّر ما تصفه، ويُنشر تاريخ سريان النسخة المعتمدة على هذه الصفحة. ولأي سؤال عنها، راسلنا من{" "}
          <Link to={paths.contact} style={linkStyle}>
            صفحة تواصل معنا
          </Link>
          . ولمعرفة البيانات التي تُجمع وأغراض معالجتها، راجع{" "}
          <Link to={paths.privacy} style={linkStyle}>
            سياسة الخصوصية
          </Link>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalGapsSection
        heading="ما يلزم لاعتماد هذه المسودة"
        items={[
          "ممارسات التشفير والنسخ الاحتياطي وصلاحيات الوصول الداخلي، بتأكيد فريق التشغيل.",
          "سياسة كلمات المرور المطبَّقة فعلًا، إن أردنا ذكر شروطها للمستخدم.",
          "تاريخ السريان المعتمد.",
        ]}
      />
    </LegalDraftShell>
  );
}

import { Link } from "react-router";
import {
  LegalDraftShell,
  LegalGapNote,
  LegalGapsSection,
  LegalList,
  LegalParagraph,
  LegalSection,
  type LegalDraftTocItem,
} from "@/features/legal/components/legal-draft-shell";
import { PRIMARY } from "@/features/landing/components/theme";
import { paths } from "@/shared/navigation/paths";

/*
  A draft, not a published policy: PUBLIC_BUSINESS_FACTS.legalLinks.privacyPolicy is still
  `status: "pending"` (TECH-48). Every fact this page cannot confirm is named as a gap in its
  own closing section rather than asserted, and nothing here claims a legal right or an
  effective date this build cannot back up.
*/

const TOC: LegalDraftTocItem[] = [
  { id: "section-1", number: 1, title: "المقدمة والنطاق" },
  { id: "section-2", number: 2, title: "البيانات التي نجمعها" },
  { id: "section-3", number: 3, title: "أغراض المعالجة" },
  { id: "section-4", number: 4, title: "ملفات تعريف الارتباط والتحليلات" },
  { id: "section-5", number: 5, title: "مزوّدو الخدمة ومشاركة البيانات" },
  { id: "section-6", number: 6, title: "الاحتفاظ بالبيانات" },
  { id: "section-7", number: 7, title: "طلبات المستخدم وخياراته" },
  { id: "section-8", number: 8, title: "معلومات التواصل" },
  { id: "section-9", number: 9, title: "تحديثات السياسة" },
];

const linkStyle = { color: PRIMARY, fontWeight: 600, textDecoration: "none", borderBlockEnd: "1px solid rgba(78,91,146,0.35)" } as const;

export function PrivacyPage() {
  return (
    <LegalDraftShell
      title="سياسة الخصوصية"
      intro="توضّح هذه الصفحة البيانات التي تجمعها منارة عند استخدامك المنصة، وسبب جمعها، ومن يمكن أن يطّلع عليها، وكيف تتواصل معنا بشأنها. النص الحالي مسودة مبنية على ما هو مطبَّق فعلًا في المنصة اليوم، وما لم يُعتمد بعد مذكور صراحةً في موضعه."
      tocLabel="محتويات سياسة الخصوصية"
      toc={TOC}
    >
      <LegalSection id="section-1" title="1. المقدمة والنطاق">
        <LegalParagraph>
          تسري هذه السياسة على استخدام موقع منارة وحسابات المتعلمين والمدرّسين عليه. وتشرح البيانات التي تُعالَج أثناء التسجيل وتسجيل الدخول وتصفّح الدورات وشرائها ومتابعة التقدم.
        </LegalParagraph>
        <LegalParagraph>
          تشير الشروط والأحكام في القسم 10 إلى هذه السياسة. وعند اعتماد النسخة النهائية، تُنشر مع تاريخ سريانها.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="section-2" title="2. البيانات التي نجمعها">
        <LegalParagraph>نجمع البيانات التي تقدّمها بنفسك، والبيانات التي يتولّد عن استخدامك للمنصة:</LegalParagraph>
        <LegalList
          items={[
            "بيانات الحساب: الاسم الكامل، والبريد الإلكتروني، ونوع الحساب (متعلّم أو مدرّس).",
            "بيانات التحقق من البريد الإلكتروني ورموز التحقق المستخدمة عند التسجيل أو استعادة كلمة المرور.",
            "بيانات التعلّم: الدورات التي انضممت إليها، والدروس التي أكملتها، ونتائج الاختبارات وتقدّمك فيها.",
            "بيانات الشراء: الطلبات المرتبطة بحسابك وحالتها. لا تُخزَّن بيانات بطاقتك البنكية على أنظمة منارة؛ تُعالج المدفوعات لدى مزوّد الدفع.",
            "بيانات الجلسة التقنية اللازمة لتشغيل تسجيل الدخول وحماية النماذج من الطلبات المزوّرة.",
          ]}
        />
        <LegalGapNote>قيد التحديد: قائمة السجلات التقنية التي يحفظها الخادم (مثل عناوين IP وسجلات الأخطاء) ومدة حفظها — تُستكمل قبل اعتماد السياسة.</LegalGapNote>
      </LegalSection>

      <LegalSection id="section-3" title="3. أغراض المعالجة">
        <LegalParagraph>نعالج بياناتك للأغراض التالية فقط:</LegalParagraph>
        <LegalList
          items={[
            "إنشاء حسابك والتحقق منه وتمكينك من تسجيل الدخول.",
            "إتاحة الدورات التي اشتريتها وحفظ تقدّمك فيها.",
            "تنفيذ عمليات الشراء ومعالجة طلبات الإلغاء والاسترداد.",
            "الرد على رسائلك وطلبات الدعم.",
            "تشغيل المنصة وحمايتها من الاستخدام غير المصرح به.",
          ]}
        />
        <LegalParagraph>لا تُستخدم بياناتك في إعلانات مخصّصة، ولا تُباع لأي طرف.</LegalParagraph>
      </LegalSection>

      <LegalSection id="section-4" title="4. ملفات تعريف الارتباط والتحليلات">
        <LegalParagraph>تستخدم منارة ملفَّي تعريف ارتباط وظيفيَّين لا غنى عنهما لتشغيل تسجيل الدخول:</LegalParagraph>
        <LegalList
          items={[
            "ملف جلسة الدخول، لا يمكن قراءته من جانب المتصفح، وتنتهي صلاحيته بانتهاء الجلسة.",
            "ملف رمز الحماية من الطلبات المزوّرة، ويُستخدم للتحقق من أن الطلبات صادرة من الموقع نفسه.",
          ]}
        />
        <LegalParagraph>
          لا يستخدم الموقع في نسخته الحالية أدوات تحليلات أو تتبّع إعلاني، ولذلك لا يعرض شريط موافقة على ملفات التتبّع. وإذا أُضيفت أي أداة تحليلات لاحقًا، تُحدَّث هذه السياسة ويُعلَن عنها قبل تشغيلها.
        </LegalParagraph>
        <LegalGapNote>قيد التحديد: تأكيد أن بيئة النشر الفعلية (الاستضافة وشبكة التوصيل) لا تضيف ملفات تعريف ارتباط أو سجلات خارج ما ذُكر أعلاه.</LegalGapNote>
      </LegalSection>

      <LegalSection id="section-5" title="5. مزوّدو الخدمة ومشاركة البيانات">
        <LegalParagraph>
          تُشارَك البيانات فقط بالقدر اللازم لتقديم الخدمة. وتُعالج المدفوعات الإلكترونية عبر كاشير، وهو ما توضحه الشروط والأحكام في القسم 4؛ لذلك تُعالج بيانات الدفع لدى مزوّد الدفع وفق سياساته، وتظل منارة مسؤولة عن تقديم الخدمة التعليمية ومتابعة طلبات الإلغاء والاسترداد.
        </LegalParagraph>
        <LegalParagraph>قد تُشارَك البيانات كذلك عند وجود التزام قانوني يوجب ذلك.</LegalParagraph>
        <LegalGapNote>قيد التحديد: القائمة الكاملة لمزوّدي الخدمة المستخدمين فعليًا (الاستضافة، البريد الصادر، تشغيل الفيديو) والدول التي تُخزَّن فيها البيانات.</LegalGapNote>
      </LegalSection>

      <LegalSection id="section-6" title="6. الاحتفاظ بالبيانات">
        <LegalParagraph>
          نحتفظ ببيانات حسابك وسجلّ تعلّمك ما دام الحساب قائمًا، وبسجلات الشراء بالقدر الذي تتطلبه المتابعة المالية والالتزامات القانونية.
        </LegalParagraph>
        <LegalGapNote>قيد التحديد: مدد الاحتفاظ المحددة لكل نوع من البيانات، وما يحدث للبيانات عند حذف الحساب — لا تُنشر هذه السياسة كنسخة معتمدة قبل تحديدها.</LegalGapNote>
      </LegalSection>

      <LegalSection id="section-7" title="7. طلبات المستخدم وخياراته">
        <LegalParagraph>
          يمكنك تعديل بيانات حسابك من صفحة الملف الشخصي. ويمكنك مراسلتنا لطلب الاطّلاع على بياناتك أو تصحيحها أو حذف حسابك، وسنوضّح لك ما يمكن تنفيذه وما يلزم الاحتفاظ به لأسباب قانونية أو مالية.
        </LegalParagraph>
        <LegalParagraph>ترسل الطلبات عبر قنوات التواصل الموضّحة في القسم 8.</LegalParagraph>
        <LegalGapNote>قيد التحديد: القانون واجب التطبيق والحقوق المقررة بموجبه، ومدة الرد على الطلبات — تُصاغ بمراجعة قانونية قبل الاعتماد.</LegalGapNote>
      </LegalSection>

      <LegalSection id="section-8" title="8. معلومات التواصل">
        <LegalParagraph>
          لأي سؤال بشأن هذه السياسة أو بشأن بياناتك، راسلنا من{" "}
          <Link to={paths.contact} style={linkStyle}>
            صفحة تواصل معنا
          </Link>
          . قناة بريد دعم مباشرة تُنشر هنا بمجرد اعتمادها من مالك المنصة.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="section-9" title="9. تحديثات السياسة">
        <LegalParagraph>
          قد تُحدَّث هذه السياسة عند تغيّر ما نجمعه أو كيفية معالجته. ويُنشر تاريخ سريان كل نسخة على هذه الصفحة، ويُخطَر المستخدمون بالتغييرات الجوهرية.
        </LegalParagraph>
      </LegalSection>

      <LegalGapsSection
        heading="ما يلزم لاعتماد هذه المسودة"
        items={[
          "الاسم القانوني للجهة المسؤولة عن المنصة (مسجَّل حاليًا كمعلَّق في إعدادات المنصة).",
          "السجلات التقنية المحفوظة على الخادم ومدد الاحتفاظ بكل نوع من البيانات.",
          "قائمة مزوّدي الخدمة ومواقع تخزين البيانات.",
          "القانون واجب التطبيق وصياغة حقوق المستخدم بمراجعة قانونية.",
          "بريد دعم معتمد للتواصل بشأن الخصوصية.",
          "تاريخ السريان المعتمد.",
        ]}
      />
    </LegalDraftShell>
  );
}

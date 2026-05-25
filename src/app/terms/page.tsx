"use client";

import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const SECTIONS = [
  {
    title: { vi: "1. Chấp nhận điều khoản", en: "1. Acceptance of Terms" },
    content: {
      vi: "Bằng cách sử dụng MoodStory, bạn đồng ý với các điều khoản này. Nếu không đồng ý, vui lòng không sử dụng ứng dụng.",
      en: "By using MoodStory, you agree to these terms. If you do not agree, please do not use the app.",
    },
  },
  {
    title: { vi: "2. Mô tả dịch vụ", en: "2. Description of Service" },
    content: {
      vi: "MoodStory là ứng dụng tạo story aesthetic từ ảnh và video bằng AI. Dịch vụ được cung cấp miễn phí và có thể thay đổi bất kỳ lúc nào.",
      en: "MoodStory is an AI-powered app for creating aesthetic stories from photos and videos. The service is free and may change at any time.",
    },
  },
  {
    title: { vi: "3. Nội dung người dùng", en: "3. User Content" },
    content: {
      vi: "Bạn giữ toàn quyền sở hữu ảnh và video bạn upload. MoodStory không lưu trữ nội dung của bạn trên server sau khi phiên làm việc kết thúc. Bạn chịu trách nhiệm về nội dung bạn tạo ra.",
      en: "You retain full ownership of photos and videos you upload. MoodStory does not store your content on servers after your session ends. You are responsible for the content you create.",
    },
  },
  {
    title: { vi: "4. Quyền riêng tư", en: "4. Privacy" },
    content: {
      vi: "MoodStory không thu thập thông tin cá nhân. Dữ liệu xử lý AI (ảnh) được gửi đến API bên thứ ba (OpenAI, Cloudinary) và bị xóa ngay sau khi xử lý. Chúng tôi không bán dữ liệu của bạn cho bất kỳ ai.",
      en: "MoodStory does not collect personal information. AI processing data (images) is sent to third-party APIs (OpenAI, Cloudinary) and deleted immediately after processing. We do not sell your data to anyone.",
    },
  },
  {
    title: { vi: "5. Hành vi bị cấm", en: "5. Prohibited Conduct" },
    content: {
      vi: "Không sử dụng MoodStory để tạo nội dung vi phạm pháp luật, nội dung khiêu dâm, hoặc nội dung gây hại cho người khác. Vi phạm có thể dẫn đến bị chặn truy cập.",
      en: "Do not use MoodStory to create illegal content, adult content, or content harmful to others. Violations may result in access being blocked.",
    },
  },
  {
    title: { vi: "6. Giới hạn trách nhiệm", en: "6. Limitation of Liability" },
    content: {
      vi: "MoodStory được cung cấp 'nguyên trạng'. Chúng tôi không chịu trách nhiệm về bất kỳ tổn thất nào phát sinh từ việc sử dụng ứng dụng.",
      en: "MoodStory is provided 'as is'. We are not liable for any losses arising from use of the app.",
    },
  },
  {
    title: { vi: "7. Thay đổi điều khoản", en: "7. Changes to Terms" },
    content: {
      vi: "Chúng tôi có thể cập nhật điều khoản này bất kỳ lúc nào. Việc tiếp tục sử dụng ứng dụng sau khi thay đổi đồng nghĩa với việc bạn chấp nhận điều khoản mới.",
      en: "We may update these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.",
    },
  },
  {
    title: { vi: "8. Liên hệ", en: "8. Contact" },
    content: {
      vi: "Nếu có câu hỏi về điều khoản này, vui lòng liên hệ qua Instagram hoặc Twitter của MoodStory.",
      en: "If you have questions about these terms, please contact us via MoodStory's Instagram or Twitter.",
    },
  },
];

export default function TermsPage() {
  const router = useRouter();
  const { locale } = useI18n();
  const isVi = locale === "vi";

  return (
    <MobileContainer>
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-12 pb-5 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => router.back()}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
            "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            "transition-all active:scale-90",
          )}
        >
          <ArrowLeftIcon />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">{isVi ? "Điều khoản & Riêng tư" : "Terms & Privacy"}</h1>
          <p className="text-xs text-[var(--text-muted)]">{isVi ? "Cập nhật lần cuối: tháng 5, 2025" : "Last updated: May 2025"}</p>
        </div>
      </header>

      {/* Content */}
      <div className="px-5 py-5 flex flex-col gap-5 animate-fade-in-up">
        {SECTIONS.map((s) => (
          <div key={s.title.en}>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">{isVi ? s.title.vi : s.title.en}</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{isVi ? s.content.vi : s.content.en}</p>
          </div>
        ))}

        <div className={cn("mt-2 px-4 py-3 rounded-2xl text-center", "bg-[var(--brand-purple-dim)] border border-[var(--brand-purple-border)]")}>
          <p className="text-xs text-[var(--brand-purple)]">{isVi ? "Sử dụng MoodStory = đồng ý với các điều khoản trên 🎞️" : "Using MoodStory = agreeing to these terms 🎞️"}</p>
        </div>
      </div>
    </MobileContainer>
  );
}

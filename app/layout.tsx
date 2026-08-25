import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '看護進学ナビ｜学費・通学・国家試験で看護学校を比較',
  description: '看護大学・看護専門学校の学費、通学、入試、国家試験合格率を同じ基準で比較できる進学情報サイト。',
  openGraph: { title: '看護進学ナビ｜学費・通学・国家試験で看護学校を比較', description: '学校選びを、数字で見える化。看護大学・専門学校を比較できます。', type: 'website' },
  twitter: { card: 'summary_large_image', title: '看護進学ナビ｜学費・通学・国家試験で看護学校を比較', description: '学校選びを、数字で見える化。' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}

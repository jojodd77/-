// 首页直接重定向到发音修正页面
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/correction');
}


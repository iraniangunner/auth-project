import Logo from '@/app/_assets/logo-horizontal.svg';
import Image from 'next/image';
import Link from 'next/link';
export default function TopNavigation() {
    return (
        <nav className="  sticky -top-1  backdrop-blur-md  z-20 border-b bg-secondary-870 border-secondary-870">
            <div className='container mx-auto h-[70px] xl:h-[90px] flex items-center  text-white'>
                <Image src={Logo} className='hidden xl:inline-block' width={200} height={150} alt="" />
                <ul className='hidden xl:flex items-center whitespace-nowrap gap-8 ms-20'>
                    <li><Link className='text-secondary-300 animate-underline animate-target' href="/">صفحه اصلی</Link></li>
                    <li><Link className='text-secondary-300 animate-underline animate-target' href="/courses">دوره‌ها</Link></li>
                    <li><Link className='text-secondary-300 animate-underline animate-target' href="/videos">ویدئوهای کوتاه</Link></li>
                    <li><Link className='animate-underline animate-target pointer-events-none text-secondary-600' href="/courses">مشاوره (به زودی)</Link></li>
                    <li><Link className='animate-underline animate-target pointer-events-none text-secondary-600' href="/courses">مصاحبه (به زودی)</Link></li>
                    <li><Link className='text-secondary-300 animate-underline animate-target' href="#contact">تماس با کلاسبن</Link></li>
                </ul>
            </div>
        </nav>
    )
}
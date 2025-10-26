import Link from 'next/link';
import { Button } from '../ui/button';
import { APP_NAME } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="p-4 flex justify-around items-center">
            <Link className="text-lg font-bold capitalize" href={'/'}>
                {APP_NAME}
            </Link>
            <ul className="flex items-center space-x-8">
                <li>
                    <Link className="hover:underline" href={'/auth/signin'}>
                        Sign In
                    </Link>
                </li>
                <li>
                    <Button asChild variant="secondary">
                        <Link href={'/auth/signup'}>
                            Get Started
                            <ArrowRight />
                        </Link>
                    </Button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;

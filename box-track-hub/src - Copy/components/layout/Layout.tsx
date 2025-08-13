import { Header } from './Header';
import { Navigation } from './Navigation';
import { DemoIndicator } from '@/components/DemoIndicator';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      <DemoIndicator />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};
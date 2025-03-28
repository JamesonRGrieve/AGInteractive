import Head from '@/appwrapper/Head';
import { SidebarContentProvider } from '@/appwrapper/SidebarContentManager';
import { SidebarContext } from '@/appwrapper/SidebarContext';
import { SidebarHeader, SidebarHeaderTitle } from '@/appwrapper/SidebarHeader';
import { SidebarMain } from '@/appwrapper/SidebarMain';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { SolanaWalletProvider } from '@/components/wallet/wallet-provider';
import InteractiveConfigContextWrapper from '@/interactive/ContextWrapper';
import { useConversation } from '@/interactive/hooks/useConversation';
import { CommandMenu } from '@/interface/Selectors/Command';
import { CommandMenuProvider } from '@/interface/Selectors/Command/command-menu-context';
import { cn } from '@/lib/utils';
import { SelectResident } from '@/ngpt/components/resident/select-resident';
import '@/zod2gql';
import { ViewVerticalIcon } from '@radix-ui/react-icons';
import { cookies } from 'next/headers';
import { useParams } from 'next/navigation';
import { ReactNode } from 'react';
import './globals.css';
import { metadata, viewport } from './metadata';
// const inter = Inter({ subsets: ['latin'] });

export { metadata, viewport };

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  const cookieStore = cookies();
  const theme = cookieStore.get('theme')?.value ?? process.env.NEXT_PUBLIC_THEME_DEFAULT_MODE;
  const appearance = cookieStore.get('appearance')?.value ?? '';

  return (
    <html lang='en'>
      <Head />
      <body className={cn(/*inter.className,*/ theme, appearance)}>
        <InteractiveConfigContextWrapper>
          <SolanaWalletProvider>
            <CommandMenuProvider>
              <SidebarContentProvider>
                <SidebarProvider className='flex-1'>
                  <SidebarMain side='left' />
                  <SidebarInset>
                    <ChatHeader />
                    <SidebarMain>{children}</SidebarMain>
                  </SidebarInset>
                  <Toaster />
                  {/* <ThemeSetter /> */}
                  <CommandMenu />
                  <SelectResident />
                  <SidebarContext side='right' />
                </SidebarProvider>
              </SidebarContentProvider>
            </CommandMenuProvider>
          </SolanaWalletProvider>
        </InteractiveConfigContextWrapper>
      </body>
    </html>
  );
}
function ChatHeader() {
  const { toggleSidebar } = useSidebar('right');
  const { id } = useParams();
  const { data: conversation } = useConversation(id ? id[0] : '');
  const title = conversation?.name || 'New Chat';

  return (
    <SidebarHeader>
      <SidebarHeaderTitle className='text-sm md:text-base max-w-[200px] truncate sm:max-w-none sm:text-clip sm:overflow-visible'>
        {title}
      </SidebarHeaderTitle>
      <div className='flex items-center h-full md:hidden'>
        <Separator orientation='vertical' className='h-4' />
        <Button variant='ghost' size='icon' onClick={toggleSidebar}>
          <ViewVerticalIcon />
          <span className='sr-only'>Toggle Sidebar</span>
        </Button>
      </div>
    </SidebarHeader>
  );
}

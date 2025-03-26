'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { ReactNode, useState } from 'react';
import { LuRefreshCw as AutorenewOutlined } from 'react-icons/lu';
import { Activity } from '../../hooks/z.js';
import MarkdownBlock from '../Message/MarkdownBlock.tsx';
import formatDate from '../Message/formatDate.ts';
import { severities } from './Severtities.tsx';

// Extend dayjs with plugins
dayjs.extend(timezone);
dayjs.extend(utc);

/**
 * Calculate and format the time difference between two timestamps
 */
export function getTimeDifference(createdAt1: string, createdAt2: string): string {
  // Convert createdAts to Date objects
  const date1 = new Date(createdAt1);
  const date2 = new Date(createdAt2);

  // Calculate the difference in milliseconds
  const diffInMs = Math.abs(date1.getTime() - date2.getTime());

  // Convert milliseconds to seconds
  const diffInSeconds = Math.floor(diffInMs / 1000);
  if (diffInSeconds === 0) return '<1s';

  // Calculate minutes and seconds
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;

  return `${minutes}m ${seconds}s`;
}

type ActivityIconsProps = {
  state: string;
  type: { name: string } | undefined;
  createdAt: string;
  updatedAt?: string;
};

/**
 * Component for displaying the activity icons and time difference
 */
const ActivityIcons: React.FC<ActivityIconsProps> = ({ state, type, createdAt, updatedAt }) => {
  const [currentTime] = useState(dayjs().format('YYYY-MM-DDTHH:mm:ssZ'));

  return (
    <div className='flex items-center justify-between gap-2 m-w-40'>
      {/* State icon */}
      {state ? severities[state.toLowerCase()].icon : <AutorenewOutlined className='animate-spin text-primary' />}

      {/* Type icon */}
      {severities[(type?.name || 'thought').toLowerCase()].icon}

      {/* Time difference */}
      {state.toLowerCase() !== 'info' && (
        <div className='whitespace-nowrap'>{getTimeDifference(createdAt, updatedAt || currentTime)}</div>
      )}

      <div className='mx-1 w-1 h-4 border-l-2' />
    </div>
  );
};

type ActivityContentProps = {
  title: string;
  body?: string;
  state: string;
  type: { name: string } | undefined;
  createdAt: string;
  updatedAt?: string;
};

/**
 * Component for displaying single activity content (with or without body)
 */
const ActivityContent: React.FC<ActivityContentProps> = ({ title, body, state, type, createdAt, updatedAt }) => {
  if (!body) {
    return (
      <div
        className={`overflow-hidden flex gap-2 agixt-activity agixt-activity-${state.toLowerCase()} text-foreground flex items-center cursor-pointer justify-start gap-2`}
      >
        <ActivityIcons state={state} type={type} createdAt={createdAt} updatedAt={updatedAt} />
        <MarkdownBlock content={title} />
      </div>
    );
  }

  return (
    <Accordion type='single' collapsible className='w-full'>
      <AccordionItem value='item' className='border-0'>
        <AccordionTrigger
          className={`overflow-hidden flex gap-2 agixt-activity agixt-activity-${state.toLowerCase()} px-4 border-l-8 text-foreground flex items-center cursor-pointer justify-start gap-2 hover:no-underline`}
        >
          <ActivityIcons state={state} type={type} createdAt={createdAt} updatedAt={updatedAt} />
          <MarkdownBlock content={title} />
        </AccordionTrigger>
        <AccordionContent className='px-2 border-l-8'>
          <MarkdownBlock content={body} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export type ActivityBarProps = Activity & {
  children: Activity[];
  alternateBackground: string;
  isRoot?: boolean;
};

/**
 * Main ActivityBar component that renders activity items and their children
 */
export function ActivityBar({
  title,
  body,
  state,
  createdAt,
  type,
  alternateBackground,
  updatedAt,
  children,
  isRoot = true,
}: ActivityBarProps): ReactNode {
  // If no children, just return the activity item with tooltip
  if (!children || children.length <= 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <ActivityContent title={title} body={body} state={state} type={type} createdAt={createdAt} updatedAt={updatedAt} />
        </TooltipTrigger>
        <TooltipContent side='bottom' align='start' className='ml-3 mb-7'>
          {formatDate(createdAt, false)}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Parent activity with children
  return (
    <div
      className={cn('w-full', !isRoot && 'border-t border-border', alternateBackground === 'primary' ? 'bg-primary/10' : '')}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='item' className='border-b-0'>
              <AccordionTrigger
                className={cn(
                  'overflow-hidden flex gap-2',
                  'w-full flex justify-start items-center px-0',
                  'hover:no-underline',
                )}
              >
                <div
                  className={`overflow-hidden flex gap-2 agixt-activity agixt-activity-${state.toLowerCase()} px-4 text-foreground flex items-center cursor-pointer justify-start gap-2`}
                >
                  <ActivityIcons state={state} type={type} createdAt={createdAt} updatedAt={updatedAt} />
                  <MarkdownBlock content={title} />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {body && (
                  <div className='px-2 mb-2'>
                    <MarkdownBlock content={body} />
                  </div>
                )}
                <div className='border-b-0'>
                  {children.map((child, index) => (
                    <ActivityBar
                      key={child.id}
                      {...child}
                      alternateBackground={alternateBackground}
                      children={[]}
                      isRoot={false}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TooltipTrigger>
        <TooltipContent side='bottom' align='start' className='ml-3 mb-7'>
          {formatDate(createdAt, false)}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

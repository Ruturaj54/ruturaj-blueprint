import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Flag, Target, Clock, Activity, BookOpen, Mail, type LucideIcon } from 'lucide-react';
import { SectionTitle } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import { SyncCard } from '@/components/settings/SyncCard';
import { ProgramSettings } from '@/components/settings/ProgramSettings';
import { AmazonSettings } from '@/components/settings/AmazonSettings';
import { TimetableSettings } from '@/components/settings/TimetableSettings';
import { ExerciseSettings } from '@/components/settings/ExerciseSettings';
import { StudyCard } from '@/components/settings/StudyCard';
import { EmailSettings } from '@/components/settings/EmailSettings';
import { DataTools } from '@/components/settings/DataTools';

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section>
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <Icon size={13} />
          {title}
        </span>
      </SectionTitle>
      {children}
    </section>
  );
}

/**
 * Settings is a column of independent cards; each one owns its own reads and
 * writes through the app-state hooks, so this screen only lays them out.
 */
export function Settings() {
  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      <Section icon={KeyRound} title="Sync">
        <SyncCard />
      </Section>
      <Section icon={Flag} title="Programme">
        <ProgramSettings />
      </Section>
      <Section icon={Target} title="Amazon">
        <AmazonSettings />
      </Section>
      <Section icon={Clock} title="Timetable">
        <TimetableSettings />
      </Section>
      <Section icon={Activity} title="Exercise">
        <ExerciseSettings />
      </Section>
      <Section icon={BookOpen} title="Study">
        <StudyCard />
      </Section>
      <Section icon={Mail} title="Mail">
        <EmailSettings />
      </Section>
      <DataTools />
    </motion.div>
  );
}

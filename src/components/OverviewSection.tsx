"use client";

import BatchGenerateCard from "@/components/BatchGenerateCard";
import DashboardStats from "@/components/DashboardStats";
import GenerateCard from "@/components/GenerateCard";

type KeyType = {
  id: number;
  key: string;
  active: boolean;
  expiresAt: string | null;
  deviceId: string | null;
  lastUsed: string | null;
  useCount: number;
  createdAt: string;
};

type Props = {
  keys: KeyType[];
  duration: string;
  generating: boolean;
  generatedKey: string;

  setDuration: (value: string) => void;
  onGenerate: () => void;
  onLoadKeys: () => Promise<void>;
  onMessage: (message: string) => void;
  onActivity: (title: string, detail: string) => void;
};

export default function OverviewSection({
  keys,
  duration,
  generating,
  generatedKey,
  setDuration,
  onGenerate,
  onLoadKeys,
  onMessage,
  onActivity,
}: Props) {
  const now = Date.now();

  const expiredCount = keys.filter(
    (item) =>
      item.expiresAt &&
      new Date(item.expiresAt).getTime() < now
  ).length;

  const activeCount = keys.filter(
    (item) =>
      item.active &&
      !(
        item.expiresAt &&
        new Date(item.expiresAt).getTime() < now
      )
  ).length;

  const deviceCount = keys.filter(
    (item) => Boolean(item.deviceId)
  ).length;

  const generatedToday = keys.filter((item) => {
    const created = new Date(item.createdAt);
    const today = new Date();

    return (
      created.getDate() === today.getDate() &&
      created.getMonth() === today.getMonth() &&
      created.getFullYear() === today.getFullYear()
    );
  }).length;

  const totalActivation = keys.reduce(
    (total, item) => total + item.useCount,
    0
  );

  return (
    <section
      id="overview"
      className="dashboard-section"
    >
      <DashboardStats
        total={keys.length}
        active={activeCount}
        expired={expiredCount}
        devices={deviceCount}
        today={generatedToday}
        activation={totalActivation}
      />

      <div className="dashboard-grid">
        <GenerateCard
          duration={duration}
          setDuration={setDuration}
          generateKey={onGenerate}
          loading={generating}
          generatedKey={generatedKey}
        />

        <BatchGenerateCard
          onSuccess={onLoadKeys}
          onMessage={onMessage}
          onActivity={onActivity}
        />
      </div>
    </section>
  );
}
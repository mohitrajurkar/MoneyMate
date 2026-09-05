import React, { useState } from 'react';
import {
  PlaySquare,
  CheckCircle2,
  Play,
  RotateCcw,
  Clock,
  Zap,
  Sparkles,
  ShieldCheck,
  QrCode,
  Calendar,
  Layers,
} from 'lucide-react';

interface WorkflowRun {
  id: string;
  workflowName: string;
  trigger: string;
  status: 'SUCCESS' | 'RUNNING' | 'QUEUED';
  duration: string;
  commitMessage: string;
  commitHash: string;
  timeAgo: string;
  branch: string;
}

interface GitHubActionsViewProps {
  onOpenUpiImport: () => void;
}

export const GitHubActionsView: React.FC<GitHubActionsViewProps> = ({ onOpenUpiImport }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState('All workflows');
  const [isRunningManualSync, setIsRunningManualSync] = useState(false);
  const [runs, setRuns] = useState<WorkflowRun[]>([
    {
      id: 'run-8910',
      workflowName: 'UPI SMS & OCR Ingestion CI',
      trigger: 'push (GPay webhook)',
      status: 'SUCCESS',
      duration: '1.2s',
      commitMessage: 'feat(upi): direct parse ₹450 Swiggy debit with auto-categorization',
      commitHash: '7c9a12e',
      timeAgo: '20 mins ago',
      branch: 'main',
    },
    {
      id: 'run-8909',
      workflowName: 'Nightly Financial Health & Liquidity Benchmark',
      trigger: 'schedule (cron 0 0 * * *)',
      status: 'SUCCESS',
      duration: '0.8s',
      commitMessage: 'audit(health): computed 78/100 score across 4 pillars',
      commitHash: '4f8e91a',
      timeAgo: '8 hours ago',
      branch: 'main',
    },
    {
      id: 'run-8908',
      workflowName: 'Recurring Bill & Subscription Renewal Watcher',
      trigger: 'schedule (daily at 06:00)',
      status: 'SUCCESS',
      duration: '1.1s',
      commitMessage: 'chore(subscriptions): checked Netflix & Spotify renewal deadlines',
      commitHash: '2b1c4e9',
      timeAgo: '1 day ago',
      branch: 'main',
    },
    {
      id: 'run-8907',
      workflowName: 'Digital Gullak Goal Auto-Deposit Sweep',
      trigger: 'workflow_dispatch',
      status: 'SUCCESS',
      duration: '1.4s',
      commitMessage: 'feat(gullak): auto-allocated ₹1,000 to New Car goal from surplus',
      commitHash: '8e3d2a1',
      timeAgo: '2 days ago',
      branch: 'main',
    },
    {
      id: 'run-8906',
      workflowName: 'Vault Ledger State & Cloud Backup',
      trigger: 'push',
      status: 'SUCCESS',
      duration: '0.9s',
      commitMessage: 'chore(backup): snapshot encrypted accounts ledger state',
      commitHash: '9a0f4b3',
      timeAgo: '3 days ago',
      branch: 'main',
    },
  ]);

  const handleRunWorkflow = () => {
    setIsRunningManualSync(true);
    setTimeout(() => {
      const newRun: WorkflowRun = {
        id: `run-${Math.floor(1000 + Math.random() * 9000)}`,
        workflowName: selectedWorkflow === 'All workflows' ? 'UPI SMS & OCR Ingestion CI' : selectedWorkflow,
        trigger: 'workflow_dispatch (Manual Run)',
        status: 'SUCCESS',
        duration: '1.0s',
        commitMessage: 'ci(sync): manual ledger trigger & budget threshold verification',
        commitHash: 'a1b2c3d',
        timeAgo: 'just now',
        branch: 'main',
      };
      setRuns([newRun, ...runs]);
      setIsRunningManualSync(false);
    }, 1200);
  };

  const workflows = [
    'All workflows',
    'UPI SMS & OCR Ingestion CI',
    'Nightly Financial Health & Liquidity Benchmark',
    'Recurring Bill & Subscription Renewal Watcher',
    'Digital Gullak Goal Auto-Deposit Sweep',
    'Vault Ledger State & Cloud Backup',
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
            <PlaySquare className="w-4 h-4 text-[#3fb950]" />
            <span>GitHub Actions: Automated Financial Pipelines</span>
          </h2>
          <p className="text-xs text-[#8b949e]">
            Continuous integration & background cron jobs powering automated UPI ingestion, health audits, and recurring bill alarms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpiImport}
            className="gh-btn text-xs hover:border-[#a371f7] text-[#a371f7]"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Import UPI</span>
          </button>

          <button
            onClick={handleRunWorkflow}
            disabled={isRunningManualSync}
            className="gh-btn gh-btn-primary text-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunningManualSync ? 'Running workflow...' : 'Run workflow'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column: Left (Workflows List) / Right (Runs Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Workflow Categories (3 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
            <div className="bg-[#161b22] px-3.5 py-2.5 border-b border-[#30363d] text-xs font-bold text-[#f0f6fc]">
              Workflows
            </div>
            <div className="divide-y divide-[#21262d] text-xs">
              {workflows.map((wf) => (
                <button
                  key={wf}
                  onClick={() => setSelectedWorkflow(wf)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                    selectedWorkflow === wf
                      ? 'bg-[#1f6feb]/15 text-[#58a6ff] font-bold border-l-2 border-[#1f6feb]'
                      : 'text-[#c9d1d9] hover:bg-[#161b22]'
                  }`}
                >
                  <span className="truncate">{wf}</span>
                  {selectedWorkflow === wf && <span className="text-[10px] font-mono">Active</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Status summary */}
          <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-2 text-xs text-[#8b949e]">
            <div className="font-bold text-[#f0f6fc] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#3fb950]" />
              <span>CI/CD Pipeline Status</span>
            </div>
            <p className="text-[11px]">
              All 5 automated financial runners are healthy with 100% test passing and sub-second webhook execution.
            </p>
            <div className="pt-2 font-mono text-[11px] flex justify-between border-t border-[#30363d]">
              <span>Average Run: 1.1s</span>
              <span className="text-[#3fb950]">● All Green</span>
            </div>
          </div>
        </div>

        {/* Right: Workflow Runs List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="gh-box border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]">
            <div className="bg-[#161b22] px-4 py-2.5 border-b border-[#30363d] flex items-center justify-between text-xs font-bold text-[#f0f6fc]">
              <span>Workflow Runs ({runs.length})</span>
              <span className="text-[11px] text-[#8b949e] font-mono">Branch: main</span>
            </div>

            <div className="divide-y divide-[#21262d]">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className="p-3.5 hover:bg-[#161b22] transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-[#3fb950] mt-0.5 shrink-0" />

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#f0f6fc] hover:text-[#58a6ff] cursor-pointer">
                          {run.workflowName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30">
                          {run.status}
                        </span>
                      </div>

                      <p className="text-[#8b949e] truncate font-mono text-[11px]">
                        {run.commitMessage}
                      </p>

                      <div className="text-[11px] text-[#8b949e] font-mono flex items-center gap-2">
                        <span>{run.trigger}</span>
                        <span>•</span>
                        <span>{run.branch}</span>
                        <span>•</span>
                        <span>{run.commitHash}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[#8b949e] font-mono text-[11px] space-y-1">
                    <div className="text-[#f0f6fc] font-semibold">{run.duration}</div>
                    <div>{run.timeAgo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { searchBuilderApi } from "@/api/search-builder";
import { EXAMPLE_QUESTIONS } from "@/data/sample";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/store/builder-store";

function renderMarkdownish(text: string) {
  return text.split("\n").map((line, j) => (
    <p key={j} className={j > 0 ? "mt-2" : ""}>
      {line.split("**").map((part, k) => (k % 2 === 1 ? <strong key={k}>{part}</strong> : part))}
    </p>
  ));
}

export const StepChat = () => {
  const chatMessages = useBuilderStore((s) => s.chatMessages);
  const citations = useBuilderStore((s) => s.citations);
  const rbac = useBuilderStore((s) => s.rbac);
  const teamsCompat = useBuilderStore((s) => s.teamsCompat);
  const addChatMessage = useBuilderStore((s) => s.addChatMessage);
  const setRbac = useBuilderStore((s) => s.setRbac);
  const setCitations = useBuilderStore((s) => s.setCitations);
  const setTeamsCompat = useBuilderStore((s) => s.setTeamsCompat);
  const [chatInput, setChatInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: (message: string) => searchBuilderApi.askChat(message),
    onSuccess: (data) => addChatMessage("assistant", data.text),
  });

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    addChatMessage("user", msg);
    setChatInput("");
    chatMutation.mutate(msg);
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">7. Agentic AI Chat</h2>
        <p className="mt-1 text-sm text-gray-500">Production chat with orchestrated agents, RBAC filtering, and citations.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/50 shadow-[0px_6px_15px_0px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {chatMessages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white", m.role === "user" ? "bg-gray-700" : "bg-orange-500")}>
                  {m.role === "user" ? "You" : "AI"}
                </div>
                <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed", m.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant")}>
                  {renderMarkdownish(m.text)}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 p-4">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask anything from enterprise knowledge…"
                aria-label="Chat message"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500 focus:ring-2"
              />
              <Button variant="primary" size="icon" loading={chatMutation.isPending} onClick={handleSend} aria-label="Send message">
                <SendRoundedIcon sx={{ fontSize: 18 }} />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionCard title="Chat Settings">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-600">Knowledge Scope</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white">All Sources</button>
                  <button type="button" className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Single Source</button>
                </div>
              </div>
              {[
                { label: "Apply RBAC / ACL Filter", value: rbac, set: setRbac },
                { label: "Use Citations", value: citations, set: setCitations },
                { label: "Teams / Copilot Compatible", value: teamsCompat, set: setTeamsCompat },
              ].map((t) => (
                <label key={t.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{t.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={t.value}
                    onClick={() => t.set(!t.value)}
                    className={cn("relative h-6 w-11 rounded-full transition", t.value ? "bg-orange-500" : "bg-gray-200")}
                  >
                    <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition", t.value && "translate-x-5")} />
                  </button>
                </label>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Example Questions">
            <div className="space-y-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button key={q} type="button" onClick={() => setChatInput(q)} className="example-question w-full rounded-xl px-3 py-2.5 text-left text-xs leading-relaxed text-gray-800 transition hover:brightness-[0.98]">
                  {q}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  );
};
